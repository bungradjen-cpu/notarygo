import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const sb = createAdminClient();
    
    // 1. Target Organization ID
    const orgId = "8dd79da6-e87a-4646-85ef-11f35fed4e98";
    
    // 2. User Credentials & Info
    const email = "inamarsina7@gmail.com".toLowerCase().trim();
    const password = "NotaryGo123!";
    const fullName = "INA MARSINA, S.H., M.Kn.";
    const orgName = "Kantor Notaris & PPAT INA MARSINA, S.H., M.Kn.";
    
    // a) Update Organization Name & Notary Name
    const { data: updatedOrg, error: orgUpdateErr } = await sb
      .from('organizations')
      .update({
        name: orgName,
        notary_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', orgId)
      .select()
      .single();
    
    if (orgUpdateErr) {
      console.warn("Org update error:", orgUpdateErr.message);
    }

    // b) Find or create user in Supabase Auth
    let targetUserId: string | undefined;

    // Search user by email using listUsers
    const { data: usersData } = await sb.auth.admin.listUsers();
    const existingAuthUser = usersData?.users?.find(u => u.email?.toLowerCase() === email);

    if (existingAuthUser) {
      targetUserId = existingAuthUser.id;
      // Update password & metadata
      await sb.auth.admin.updateUserById(targetUserId, {
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
    } else {
      const { data: newAuth, error: createErr } = await sb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      if (createErr) throw new Error("Create user error: " + createErr.message);
      targetUserId = newAuth?.user?.id;
    }

    if (!targetUserId) {
      throw new Error("Target user ID not found");
    }

    // c) Update Profile
    const { data: profileData, error: profileErr } = await sb
      .from('profiles')
      .upsert({
        id: targetUserId,
        email: email,
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileErr) {
      console.warn("Profile upsert error:", profileErr.message);
    }

    // d) Ensure Role is OWNER in organization_members
    const { data: existingMember } = await sb
      .from('organization_members')
      .select('*')
      .eq('org_id', orgId)
      .eq('profile_id', targetUserId)
      .maybeSingle();

    let memberResult;
    if (existingMember) {
      const { data: updatedMem, error: memErr } = await sb
        .from('organization_members')
        .update({
          role: "OWNER"
        })
        .eq('id', existingMember.id)
        .select()
        .single();
      if (memErr) throw new Error("Update member error: " + memErr.message);
      memberResult = updatedMem;
    } else {
      const { data: newMem, error: memErr } = await sb
        .from('organization_members')
        .insert({
          org_id: orgId,
          profile_id: targetUserId,
          role: "OWNER"
        })
        .select()
        .single();
      if (memErr) throw new Error("Insert member error: " + memErr.message);
      memberResult = newMem;
    }

    // e) Ensure Active Subscription (1 Year)
    const { data: currentSub } = await sb
      .from('subscriptions')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle();

    let subResult = currentSub;
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    if (!currentSub) {
      const { data: newSub } = await sb
        .from('subscriptions')
        .insert({
          org_id: orgId,
          status: "ACTIVE",
          current_period_start: new Date().toISOString(),
          current_period_end: oneYearLater,
        })
        .select()
        .single();
      subResult = newSub;
    } else {
      const { data: updatedSub } = await sb
        .from('subscriptions')
        .update({
          status: "ACTIVE",
          current_period_end: oneYearLater,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id)
        .select()
        .single();
      subResult = updatedSub;
    }

    return NextResponse.json({
      success: true,
      message: "Akun Ina Marsina berhasil diatur sebagai OWNER kantor!",
      organization: {
        id: orgId,
        name: updatedOrg?.name || orgName,
        notary_name: updatedOrg?.notary_name || fullName
      },
      user: {
        id: targetUserId,
        email: email,
        full_name: profileData?.full_name || fullName,
        role: memberResult?.role
      },
      subscription: {
        status: subResult?.status,
        expires_at: subResult?.current_period_end
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
