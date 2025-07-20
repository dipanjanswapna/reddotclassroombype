
'use server';
import 'dotenv/config';

import { revalidatePath } from 'next/cache';
import { addReward, deleteReward, updateReward, createRedeemRequest as createRequestInDb, updateRedeemRequest, getUser, updateUser } from '@/lib/firebase/firestore';
import { Reward, RedemptionRequest } from '@/lib/types';
import { removeUndefinedValues } from '@/lib/utils';
import { runTransaction, doc } from 'firebase/firestore';
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

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User not found.");
            }
            const userData = userDoc.data();
            const currentPoints = userData.referralPoints || 0;

            if (currentPoints < requestData.pointsSpent) {
                throw new Error("You do not have enough points to redeem this reward.");
            }

            const newPoints = currentPoints - requestData.pointsSpent;
            transaction.update(userRef, { referralPoints: newPoints });
            
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
    try {
        await updateRedeemRequest(requestId, { status });
        revalidatePath('/admin/store/redeem-requests');
        // Optionally, send a notification to the user here.
        return { success: true, message: "Request status updated." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
