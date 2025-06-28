import { redirect } from 'next/navigation';

// This page now acts as a permanent redirect to the new /sites/... structure
// to preserve any old links or bookmarks.
export default function OldPartnerSiteRedirect({ params }: { params: { site: string } }) {
  redirect(`/sites/${params.site}`);
}
