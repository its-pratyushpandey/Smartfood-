import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

import connectDB from "./config/db.js";
import Supplier from "./models/Supplier.js";
import Query from "./models/Query.js";
import { SUPPLIER_CATEGORIES, SUPPLIER_STATUSES, QUERY_CATEGORIES, QUERY_PRIORITIES, QUERY_STATUSES } from "./utils/constants.js";

dotenv.config();

const generateSuppliers = (count) => {
  const suppliers = [];
  for (let i = 0; i < count; i++) {
    suppliers.push({
      name: faker.company.name(),
      contactPerson: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      category: faker.helpers.arrayElement(SUPPLIER_CATEGORIES),
      status: faker.helpers.arrayElement(SUPPLIER_STATUSES),
      location: faker.location.city(),
    });
  }
  return suppliers;
};

const generateQueries = (count, suppliers) => {
  const queries = [];
  for (let i = 0; i < count; i++) {
    const supplier = faker.helpers.arrayElement(suppliers);
    const status = faker.helpers.arrayElement(QUERY_STATUSES);
    const dueDate = faker.date.future();

    queries.push({
      queryId: `Q${faker.string.alphanumeric(8).toUpperCase()}`,
      supplierId: supplier._id,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(2),
      category: faker.helpers.arrayElement(QUERY_CATEGORIES),
      priority: faker.helpers.arrayElement(QUERY_PRIORITIES),
      status,
      dueDate,
      referenceProduct: `Product ${faker.string.alphanumeric(5)}`,
      timeline: [
        {
          status: "Pending",
          message: "Query raised and sent to supplier.",
          timestamp: faker.date.recent(),
          actor: "QA Manager",
        },
      ],
    });
  }
  return queries;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Database connected.");

    console.log("Clearing existing data...");
    await Supplier.deleteMany({});
    await Query.deleteMany({});
    console.log("Existing data cleared.");

    console.log("Generating new data...");
    const suppliers = generateSuppliers(15);
    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log(`${createdSuppliers.length} suppliers created.`);

    const queries = generateQueries(40, createdSuppliers);
    const createdQueries = await Query.insertMany(queries);
    console.log(`${createdQueries.length} queries created.`);

    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

seedDatabase();