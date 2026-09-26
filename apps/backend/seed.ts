import { environment } from './src/config/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { schema } from '@repo/schemas/database';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, username } from 'better-auth/plugins';
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
  plugins: [admin(), username()],
});

const users = [
  {
    name: 'Admin User',
    email: environment.SEED_ADMIN_EMAIL,
    username: environment.SEED_ADMIN_USERNAME,
    password: environment.SEED_ADMIN_PASSWORD!,
    role: 'admin',
  },
  {
    name: 'Didi Walakutty',
    email: environment.SEED_DIDI_EMAIL,
    username: environment.SEED_DIDI_USERNAME,
    password: environment.SEED_DIDI_PASSWORD!,
    role: 'user',
  },
  {
    name: 'Homer Simpson',
    email: environment.SEED_HOMER_EMAIL,
    username: environment.SEED_HOMER_USERNAME,
    password: environment.SEED_HOMER_PASSWORD!,
    role: 'user',
  },
];

async function seed() {
  for (const user of users) {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });

    if (existingUser) {
      if (existingUser.role !== user.role) {
        await db
          .update(schema.users)
          .set({ role: user.role })
          .where(eq(schema.users.id, existingUser.id));
      }
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

    await db
      .update(schema.users)
      .set({ role: user.role })
      .where(eq(schema.users.id, result.user.id));

    console.log(`Created ${user.role}: ${user.email}`);
  }

  const organizer = await db.query.users.findFirst({
    where: eq(schema.users.email, environment.SEED_ADMIN_EMAIL),
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
      title: event.title,
      category: event.category,
      location: event.location,
      address: event.address,
      maxCapacity: event.maxCapacity,
      image: event.image,
      description: event.description,
      organizerId: organizer.id,
      dateTime: new Date(`${event.date}T${event.time}:00`),
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
