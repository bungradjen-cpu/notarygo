import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const sb = createAdminClient();
    
    // 1. Target Organization ID from user's screenshot
    const orgId = "8dd79da6-e87a-4646-85ef-11f35fed4e98";
    
    // 2. Setup Ina's Account
    const email = "inamarsina7@gmail.com";
    const password = "NotaryGoPassword123!";
    
    // a) Delete any orphaned profile first
    const { data: orphanedProfile } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
    if (orphanedProfile) {
      // If it exists, check if it's in auth.users
      const { data: userInAuth } = await sb.auth.admin.getUserById(orphanedProfile.id).catch(() => ({ data: null }));
      if (!userInAuth || !userInAuth.user) {
        await sb.from('profiles').delete().eq('id', orphanedProfile.id);
      }
    }
    
    // b) Create user in auth.users
    const { data: authData, error: authErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Ina Marsina" }
    });
    
    let targetUserId = authData?.user?.id;
    if (authErr) {
      // If already exists, find the user
      if (authErr.message.includes("already registered")) {
         const { data: p } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
         targetUserId = p?.id;
         if (targetUserId) {
            await sb.auth.admin.updateUserById(targetUserId, { password });
         }
      }
    }
    
    // c) Ensure profile exists
    if (targetUserId) {
      await sb.from('profiles').upsert({
        id: targetUserId,
        email: email,
        full_name: "Ina Marsina"
      });
      
      // d) Add to organization
      const { data: existingMember } = await sb.from('organization_members').select('id').eq('org_id', orgId).eq('profile_id', targetUserId).maybeSingle();
      if (!existingMember) {
        await sb.from('organization_members').insert({
          org_id: orgId,
          profile_id: targetUserId,
          role: "STAFF"
        });
      }
    }
    
    // 3. Setup 1 Year Subscription
    const { data: currentSubData } = await sb.from('subscriptions').select('*').eq('org_id', orgId).maybeSingle();
    let currentSub = currentSubData;
    if (!currentSub) {
      const { data: newSub } = await sb.from('subscriptions').insert({
        org_id: orgId,
        status: "ACTIVE",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date().toISOString(),
      }).select().single();
      currentSub = newSub;
    }
    
    // Add 365 days
    if (currentSub) {
      const currentEnd = currentSub.current_period_end ? new Date(currentSub.current_period_end) : new Date();
      const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + 365 * 24 * 60 * 60 * 1000);
      
      await sb.from('subscriptions').update({
        status: "ACTIVE",
        current_period_end: newEnd.toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', currentSub.id);
    }
    
    return NextResponse.json({ success: true, message: "Ina's account and 1-year subscription setup successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
