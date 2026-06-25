import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zxybhfpzopjcyjemifob.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usersToCreate = [
  {
    email: 'm.pbahos23@gmail.com',
    password: 'hola123456',
    role: 'admin',
    full_name: 'Dueño'
  },
  {
    email: 'brycebueno15@gmail.com',
    password: 'antares152004',
    role: 'carrier',
    full_name: 'Conductor'
  },
  {
    email: 'wiocompany7@gmail.com',
    password: 'zentra2024',
    role: 'client',
    full_name: 'Cliente'
  }
];

async function run() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  for (const user of usersToCreate) {
    console.log(`Processing user: ${user.email} with role: ${user.role}`);
    
    // 1. Create or update user in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        full_name: user.full_name
      }
    });

    let userId = null;

    if (userError) {
      const errMsg = userError.message.toLowerCase();
      if (errMsg.includes("registered") || errMsg.includes("exists") || errMsg.includes("already")) {
        console.log(`User ${user.email} already exists in auth.users. Fetching user ID...`);
        // Find user by email
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error("Error listing users:", listError.message);
          continue;
        }
        const existingUser = listData.users.find(u => u.email === user.email);
        if (existingUser) {
          userId = existingUser.id;
          console.log(`Found existing user ID: ${userId}. Updating password and metadata...`);
          const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: user.password,
            email_confirm: true,
            user_metadata: {
              role: user.role,
              full_name: user.full_name
            }
          });
          if (updateError) {
            console.error(`Error updating user ${user.email}:`, updateError.message);
          }
        } else {
          console.error(`User exists according to error but could not find user in list.`);
          continue;
        }
      } else {
        console.error(`Error creating user ${user.email}:`, userError.message);
        continue;
      }
    } else {
      userId = userData.user.id;
      console.log(`User created successfully: ${userId}`);
    }

    if (userId) {
      // 2. Upsert profile in public.profiles
      const { error: profileError } = await supabase.from('profiles').upsert([{
        id: userId,
        full_name: user.full_name,
        role: user.role
      }], { onConflict: 'id' });

      if (profileError) {
        console.error(`Error inserting profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`Profile upserted successfully for ${user.email}`);
      }
    }
  }
  
  console.log("Done.");
}

run();
