import { Client, Databases, ID } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

async function setupDatabase() {
    try {
        // First, ensure the database exists
        try {
            await databases.get(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!);
            console.log('✅ Database exists');
        } catch {
            await databases.create(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                'Notes Database'
            );
            console.log('✅ Database created');
        }

        // Then, ensure the collection exists
        try {
            await databases.getCollection(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!
            );
            console.log('✅ Collection exists');
        } catch {
            await databases.createCollection(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                'Notes Collection'
            );
            console.log('✅ Collection created');
        }

        // Create attributes
        const attributes = [
            {
                key: 'text',
                type: 'string',
                size: 16384,
                required: true
            },
            {
                key: 'pinned',
                type: 'boolean',
                required: false,
                default: false
            },
            {
                key: 'color',
                type: 'string',
                size: 255,
                required: false,
                default: 'default'
            }
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default
                    );
                    console.log(`✅ Created string attribute: ${attr.key}`);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                        attr.key,
                        attr.required,
                        attr.default
                    );
                    console.log(`✅ Created boolean attribute: ${attr.key}`);
                }
            } catch (error: any) {
                // If attribute already exists, that's fine
                if (error.code !== 409) {
                    console.error(`❌ Error creating attribute ${attr.key}:`, error);
                } else {
                    console.log(`ℹ️ Attribute ${attr.key} already exists`);
                }
            }
        }

        console.log('✅ Database schema setup completed successfully!');
    } catch (error) {
        console.error('❌ Error setting up database schema:', error);
    }
}

// Only run if this file is being executed directly
if (require.main === module) {
    setupDatabase();
}