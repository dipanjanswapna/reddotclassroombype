
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms of service for using the Red Dot Classroom platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="mb-4"><em>Last updated: {new Date().toLocaleDateString()}</em></p>
        
        <p>These Terms & Conditions (“Terms”) of (a) use of our website RED DOT CLASSROOM (“Website”), our applications (“Application”) or any products or services in connection with the Application/, Website/products (“Services”) or (b) any modes of registrations or usage of products, including through SD cards, tablets or other storage/transmitting device are between RED DOT CLASSROOM (RDC) (“Company/We/Us/Our”) and its users (“User/You/Your”).</p>

        <p>Please carefully read the terms and privacy policy of the Company (“Privacy Policy”) prior to registering, using the application, website, or services. Any discrepancies between the Terms and other policies on the application, website, or service are settled in favor of the Terms.</p>

        <p>You accept and agree to be legally bound by the Terms if you access the Application, Website, or Services through any means.</p>

        <p>To avoid any potential conflicts, please refrain from using the application, website, or services if you have any issues with the terms or privacy policy. Our Application along with all our services and products can only be accessed through a registration/subscription.</p>

        <h2 className="font-headline text-2xl font-bold pt-4">Proprietary Information</h2>
        <p>The software, text, images, graphics, video, script, and audio, including any other information, content, material, trademarks, service marks, trade names, and trade secrets, all of which are contained in the Application, Website, and services and products, are the Company's proprietary property (“Proprietary Information”). Permission to reproduce, reuse, modify, and distribute Proprietary Information may not be granted without first obtaining permission from the Company. Moreover, no User of this Application, Website, or Services may claim any ownership in or to the intellectual property rights of the Company. You can keep control of the contents, but the company always maintains ownership of the information, content, and all intellectual property on that medium. While using the Website, you may encounter materials that belong to other people. To ensure that the content is faithful to the original, prior consent was obtained from the subject and all rights to the content belong to the third party. Furthermore, you accept that all intellectual property, including trademarks, copyrights, logos, and service marks, remains the property of the respective third party, and you are not entitled to use it without the third party's permission.</p>

        <p>It is prohibited to use our products, services, website, and application for any purpose other than personal or non-commercial. It is prohibited to use the application, website, services, or products for any purpose except personal ones. The following rules apply to your use of this application, website, and our services for personal and non-commercial purposes:</p>
        
        <ol className="list-decimal pl-6 space-y-2">
            <li>You may not copy, modify, translate, display, distribute, or perform any information or software obtained from the Application and / or our Website and/or Services/Products or remove any copyright, trademark registration, or other proprietary notices from the contents of the Application and / or and / or our Website and/or Services/Products.</li>
            <li>You are prohibited from using this application, our website, and our products and services for commercial purposes, including but not to limited to selling, advertising, or promoting the application or any of our products or services, asking for contributions or donations, or using public forums for commercial purposes.</li>
        </ol>

        <Card className="my-8 bg-muted">
            <CardHeader>
                <CardTitle className="font-headline text-xl">Course Policy</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 space-y-2 font-bengali">
                    <li>এক কোর্স থেকে অন‍্য কোর্সে স্থানান্তর করা যাবে না।</li>
                    <li>একদম নতুন খোলা/ফেইক নেম এর আইডি গ্রহনযোগ্য না। বিশেষ ক্ষেত্রে গার্জিয়ান এর আইডি ব্যবহার করা যেতে পারে।</li>
                    <li>একটি আইডি দিয়ে এপ্রুভালের পর কোনমতেই আইডি চেইঞ্জ করা যাবে না।</li>
                    <li>ফেসবুক আইডি ব্যান হলে এর দায় কর্তৃপক্ষ নিবে না।</li>
                    <li>তোমার আইপি ট্র্যাক করা হবে কোর্স চলাকালে।</li>
                    <li>কোন মতেই কোর্স এর পেমেন্ট রিফান্ড এবল না।</li>
                    <li>একাধিক ডিভাইস / ব্রাউজারে লগিন করতে চাইলে আমাদের পূর্ব অনুমতি নিতে হবে। নতুবা কোর্স থেকে যেকোন সময় রিফান্ডসহ / বিনা রিফান্ডে ব‍্যান করা হতে পারে।</li>
                </ul>
            </CardContent>
        </Card>
        
        <h2 className="font-headline text-2xl font-bold pt-4">Prohibited Acts</h2>
        <p>The following acts are strictly banned when using our services:</p>
        <ul className="list-disc pl-6 space-y-2">
            <li>Make available any deceptive, unlawful, hazardous, abusive, torturing, defamatory, libelous, vulgar, obscene, child pornographic, loud, lascivious, unlawful, intrusive, hateful, racial, ethnic or otherwise objectionable content;</li>
            <li>Threatening, stalking, and/or harassing another person, as well as inciting another person to conduct violence;</li>
            <li>Passing on information that encourages illegal acts, that results in civil liability, or that violates any applicable laws, regulations, or guidelines;</li>
            <li>Doing anything that interferes with another person's usage or enjoyment of the Application/Website/Services;</li>
            <li>To engage in making, copying, transmitting, storing, or otherwise reproducing any intellectual property protected under copyright law, doing anything that amounts to an infringement of intellectual property, or providing others with access to anything that infringes on any intellectual property or other proprietary rights of any party;</li>
            <li>Provide anyone with information or anything else that You have no right to make available under any law or contract or fiduciary duty, unless You have control of the rights or You have obtained the necessary consent to do so;</li>
            <li>Falsely impersonate any person or entity, or misrepresent your relationship with any person or entity;</li>
            <li>Do not transmit, share, or otherwise make available any material that has viruses, trojans, worms, spyware, time bombs, cancelbots, or other computer programming routines, code, files, or programs that could harm the application/services, interests, or rights of other users, or limit the functionality of any computer software, hardware, or telecommunications;</li>
            <li>You may not use the application or access the website in any way that could harm, overload, or crash any of the application's or website's servers or networks;</li>
            <li>Violate any laws or restrictions that pertain to your use of the Application/Website/Services/products, break the rules of the networks connected to the Application/Website/Services/Products, or do anything you are banned from doing by these Terms;</li>
            <li>Disrupt, interfere with, or otherwise cause harm to the security of, or gain unauthorized access to accounts, servers, or networks connected to or accessible through the Application/Website/Services/Products or any affiliated or related sites;</li>
            <li>Disrupt access to the Application/Website/Services/Products or any of our other sites or systems, or participate in attacks such as denial of service;</li>
            <li>The Application/Website/Services/Products may not be accessed, acquired, copied, or monitored in any way by any means not made explicitly available through the Application/Website/Services/Products, including but not limited to manual processes, devices, programs, algorithms, methodologies, or similar or equivalent devices, tools, or manual activities;</li>
            <li>Change or alter any element of the Services;</li>
            <li>You are not permitted to use the Services in the following circumstances: I in contradiction to these Terms; and (ii) to the extent that it is prohibited by law, regulation, or generally accepted practices or standards in the relevant country;</li>
            <li>Any of the terms in the Agreement for the use of the Application/Website/Services/products are to be avoided.</li>
        </ul>

        <h2 className="font-headline text-2xl font-bold pt-4">User Content</h2>
        <p>You grant us a worldwide, non-exclusive, royalty-free license (with the right to sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute your content that you submit to or through the Services, as well as to associate your content with you, unless prohibited. You provide permission for others to use Your Material in the same manner that any other content found on the Services may be used. The Services may allow other users to make copies of your content in line with these Terms. You will still be able to access your content and information if you deactivate your account.</p>

        <h2 className="font-headline text-2xl font-bold pt-4">Disclaimer of Information</h2>
        <p>To ensure that the information provided is current, correct, and clear, every effort has been taken in the production of the Application/Website/Services/Products and contents therein. While unintentional mistakes may occur, The Company expressly disclaims any responsibility for the veracity of information that may be in the application. Users' input is encouraged to make the application and its contents error-free and user-friendly. The company also retains the right to make any modifications or revisions to the contents at any time, without advance notice. Neither the company nor any third parties give any guarantees regarding the accuracy, timeliness, or suitability of the information and materials found or offered on Application/Website/Services/Products for any specific purpose. You know that there might be flaws in the information and materials we're providing, and we make no promises about their accuracy.</p>
        
        <h2 className="font-headline text-2xl font-bold pt-4">Eligibility</h2>
        <p>Those who are under the age of 18, are not in debt resolution, or similar are not eligible to register for Our products or Services. For those under 18, the usage of our products and services is subject to your legal guardian or parents agreeing to the terms of our contract. If a minor uses the Application/Website/Services, it is presumed that he/she has received the approval of his/her legal guardian or parents, and that the legal guardian or parents has granted permission for him/her to use the Application/Website/Services. The company is not liable for any problems arising out of misuse of our products or services, including use by a minor. You agree that you and your students are using correct and complete data when using the Application, and that parents/legal guardians have given their authorization for students to use the software (in case of minors). In case it is found that you are under the age of 18 (eighteen) years and your parent/legal guardian has not given their approval to use the products or services, the company retains the right to end your membership and/or deny you access to the products or services. You are aware that we do not have the duty to make sure you meet the above requirements. You must personally guarantee that you meet the necessary qualifications. All those who are under the age of 18 (eighteen) must obtain the permission of their parents or legal guardians before submitting personal or family information to the Application.</p>

        <h2 className="font-headline text-2xl font-bold pt-4">Indemnity</h2>
        <p>You accept responsibility for protecting, reimbursing, and holding harmless the Company, its officers, directors, employees, and agents from any and all claims, costs, debts, and liabilities (including legal fees) incurred because of: (i) your use of and access to the Application/Website/Services; (ii) your violation of any of these Terms or any other policy of the Company; (iii) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (iv) any claim that your use of the Application/Website/Services has caused damage to a third party. The obligation to defend and reimburse the injured party will exist even after the agreement.</p>

        <h2 className="font-headline text-2xl font-bold pt-4">General Provisions</h2>
        <ul className="list-disc pl-6 space-y-2">
            <li>To ensure that any legal notifications are properly sent, please note that the Company will use your email address and/or the application to notify you. The Company should be notified at support@reddotclassroom.com.</li>
            <li>The entire contract The Terms, the Privacy Policy, and any other rules deemed relevant to the Application apply to you and your use of the Application, Website, and Services.</li>
            <li>The Terms cannot be transferred or assigned to any other party. The Company may freely transfer its rights under the Terms to any other parties without needing your permission.</li>
            <li>If any provision of the Terms is deemed unenforceable, the remaining terms shall continue in full force and effect.</li>
            <li>The Company will not waive any of its rights under the Terms by failing to enforce or exercise them.</li>
            <li>You agree that by being a part of the service, you are not a company employee, agency, partnership, or franchise.</li>
            <li>To make sure you're aware of the terms that apply to your use of the website/application and services, the Company provides these terms.</li>
            <li>You have agreed to these terms after the company provided you with a sufficient amount of time to evaluate them.</li>
        </ul>

        <h2 className="font-headline text-2xl font-bold pt-4">Feedback</h2>
        <p>Your information, provided about the Application, will be considered non-confidential. Applications can use the information whatever they choose. In addition, you represent and warrant by sending feedback that (i) your feedback does not contain confidential or patent information from you or third parties; (ii) the Company is not obligated or implied to maintain confidentiality regarding feedback; (iii) the Application could be similar to the feedback already being considered or under development;</p>

        <h2 className="font-headline text-2xl font-bold pt-4">Customer Service</h2>
        <p>We'll do all in our power to make your experience enjoyable. If you run into any problems, please get in touch with us.</p>

      </div>
    </div>
  );
}
