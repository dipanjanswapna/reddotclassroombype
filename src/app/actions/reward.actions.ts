

'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addReward, deleteReward, updateReward, createRedeemRequest as createRequestInDb, updateRedeemRequest, getUser, updateUser, getReward, addPromoCode } from '@/lib/firebase/firestore';
import { Reward, RedemptionRequest, PromoCode } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';
import { runTransaction, doc, writeBatch } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase/config';

export async function saveRewardAction(rewardData: Partial<Reward>) {
  try {
    const { id, ...data } = rewardData;
    const cleanData = removeUndefinedValues(data);

    if (id) {
      await updateReward(id, cleanData);
    } else {
      if (!cleanData.title || !cleanData.pointsRequired) {
          throw new Error("Missing required fields for new reward.");
      }
      await addReward(cleanData as Omit<Reward, 'id'>);
    }
    
    revalidatePath('/admin/store/rewards');
    revalidatePath('/student/rewards');

    return { success: true, message: 'Reward saved successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteRewardAction(id: string) {
    try {
        await deleteReward(id);
        revalidatePath('/admin/store/rewards');
        revalidatePath('/student/rewards');
        return { success: true, message: 'Reward deleted successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function createRedeemRequest(requestData: Omit<RedemptionRequest, 'id' | 'requestedAt'>) {
    const db = getDbInstance();
    if (!db) throw new Error("Database service is not available.");

    const userRef = doc(db, 'users', requestData.userId);
    const rewardRef = doc(db, 'rewards', requestData.rewardId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const rewardDoc = await transaction.get(rewardRef);
            
            if (!userDoc.exists()) throw new Error("User not found.");
            if (!rewardDoc.exists()) throw new Error("Reward not found.");
            
            const userData = userDoc.data();
            const rewardData = rewardDoc.data() as Reward;

            const currentPoints = userData.referralPoints || 0;

            if (currentPoints < requestData.pointsSpent) {
                throw new Error("You do not have enough points to redeem this reward.");
            }
            if ((rewardData.stock ?? 1) <= 0) {
                 throw new Error("This reward is out of stock.");
            }

            const newPoints = currentPoints - requestData.pointsSpent;
            transaction.update(userRef, { referralPoints: newPoints });

            if (rewardData.type === 'physical_gift') {
                transaction.update(rewardRef, { stock: (rewardData.stock || 0) - 1 });
            }
            
            await createRequestInDb(requestData);
        });
        
        revalidatePath('/student/rewards');
        revalidatePath('/admin/store/redeem-requests');
        return { success: true, message: 'Redemption request created successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function updateRedeemRequestStatusAction(requestId: string, status: RedemptionRequest['status']): Promise<{ success: boolean, message: string }> {
    const db = getDbInstance();
    if (!db) throw new Error("Firestore is not available.");

    try {
        const batch = writeBatch(db);
        const requestRef = doc(db, 'redeem_requests', requestId);
        const requestDoc = await getDoc(requestRef);
        if(!requestDoc.exists()) throw new Error("Request not found.");

        const requestData = requestDoc.data() as RedemptionRequest;
        
        let updates: Partial<RedemptionRequest> = { status };

        if(status === 'Approved') {
            const reward = await getReward(requestData.rewardId);
            if(reward?.type === 'promo_code' && reward.promoCodeDetails) {
                 const newPromoCode: Omit<PromoCode, 'id'> = {
                    code: `REWARD-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    type: reward.promoCodeDetails.type,
                    value: reward.promoCodeDetails.value,
                    usageCount: 0,
                    usageLimit: 1,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
                    isActive: true,
                    applicableCourseIds: reward.promoCodeDetails.applicableCourseIds || ['all'],
                    createdBy: 'admin_reward',
                    restrictedToUserId: requestData.userId,
                };
                await addPromoCode(newPromoCode);
                updates.generatedPromoCode = newPromoCode.code;
                updates.status = 'Completed'; // Auto-complete promo code rewards
            }
        }
        
        batch.update(requestRef, updates);
        await batch.commit();

        revalidatePath('/admin/store/redeem-requests');
        return { success: true, message: "Request status updated." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
