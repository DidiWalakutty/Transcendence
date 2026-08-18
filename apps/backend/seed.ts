import { environment } from './src/config/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { schema } from '@repo/schemas/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { seedEvents } from './seed-data/events';

const pool = new Pool({
  connectionString: environment.DATABASE_URL,
});

const db = drizzle({
  client: pool,
  schema,
});

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  secret: environment.BETTER_AUTH_SECRET!,
  baseURL: environment.BETTER_AUTH_URL!,
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  user: {
    fields: {
      image: 'avatar',
    },
    additionalFields: {
      isAdministrator: {
        type: 'boolean',
        input: false,
        defaultValue: false,
      },
      aboutMe: {
        type: 'string',
        required: false,
      },
      location: {
        type: 'string',
        required: false,
      },
      preferedLanguage: {
        type: 'string',
        required: false,
        defaultValue: 'english',
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [username()],
});

const users = [
  {
    name: 'Admin User',
    email: 'admin@transcendence.local',
    username: 'admin',
    password: environment.SEED_ADMIN_PASSWORD!,
    isAdministrator: true,
  },
  {
    name: 'Didi Walakutty',
    email: 'didi@example.com',
    username: 'didi_walakutty',
    password: environment.SEED_DIDI_PASSWORD!,
    isAdministrator: false,
  },
  {
    name: 'Homer Simpson',
    email: 'homer@example.com',
    username: 'homer_simpson',
    password: environment.SEED_HOMER_PASSWORD!,
    isAdministrator: false,
  },
];

async function seed() {
  for (const user of users) {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });

    if (existingUser) {
      console.log(`User already exists: ${user.email}`);
      continue;
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: user.name,
        email: user.email,
        password: user.password,
        username: user.username,
      },
    });

    if (!result?.user) {
      throw new Error(`Failed to create user: ${user.email}`);
    }

    if (user.isAdministrator) {
      await db
        .update(schema.users)
        .set({ isAdministrator: true })
        .where(eq(schema.users.id, result.user.id));
    }

    console.log(`Created ${user.isAdministrator ? 'admin' : 'user'}: ${user.email}`);
  }

  const organizer = await db.query.users.findFirst({
    where: eq(schema.users.email, 'admin@transcendence.local'),
  });

  if (!organizer) {
    throw new Error('Admin user not found. Users must be seeded first.');
  }

  for (const event of seedEvents) {
    const existingEvent = await db.query.events.findFirst({
      where: eq(schema.events.title, event.title),
    });

    if (existingEvent) {
      console.log(`Event already exists: ${event.title}`);
      continue;
    }

    await db.insert(schema.events).values({
      ...event,
      organizerId: organizer.id,
      dateTime: new Date(event.dateTime),
    });

    console.log(`Created event: ${event.title}`);
  }
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
