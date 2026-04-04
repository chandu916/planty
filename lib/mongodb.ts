import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Please define MONGODB_URI in your .env.local file.\n" +
    "Get it from: https://cloud.mongodb.com → Connect → Drivers"
  );
}

// In development, reuse the client across hot reloads (avoids connection pool exhaustion)
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/** Helper: returns the PlantyDB database */
export async function getDb() {
  const client = await clientPromise;
  return client.db("PlantyDB");
}
