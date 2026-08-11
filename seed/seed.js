import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Supplier from "../models/Supplier.js";
import Query from "../models/Query.js";
import { TIMELINE_EVENTS } from "../utils/constants.js";

dotenv.config();

const suppliers = [
  {
    name: "FreshHarvest Foods",
    contactPerson: "Amelia Turner",
    email: "amelia.turner@freshharvest.com",
    phone: "+1 415 555 0101",
    category: "Ingredients",
    status: "Active",
    location: "California, USA",
  },
  {
    name: "GreenFields Ingredients",
    contactPerson: "Noah Patel",
    email: "noah.patel@greenfields.com",
    phone: "+44 20 5555 0188",
    category: "Grains",
    status: "Active",
    location: "Leeds, UK",
  },
  {
    name: "PureGrain Suppliers",
    contactPerson: "Sophia Chen",
    email: "sophia.chen@puregrain.co",
    phone: "+61 2 5555 0144",
    category: "Grains",
    status: "Under Review",
    location: "Melbourne, Australia",
  },
  {
    name: "NatureSource Foods",
    contactPerson: "Ethan Brooks",
    email: "ethan.brooks@naturesource.io",
    phone: "+1 312 555 0199",
    category: "Organic Produce",
    status: "Active",
    location: "Illinois, USA",
  },
  {
    name: "AgriFresh Organics",
    contactPerson: "Mia Rossi",
    email: "mia.rossi@agrifresh.eu",
    phone: "+39 06 5555 0170",
    category: "Organic Produce",
    status: "Active",
    location: "Rome, Italy",
  },
  {
    name: "SafePack Materials",
    contactPerson: "Lucas Bennett",
    email: "lucas.bennett@safepack.com",
    phone: "+1 646 555 0138",
    category: "Packaging",
    status: "Active",
    location: "New York, USA",
  },
  {
    name: "HarvestPro Ingredients",
    contactPerson: "Zara Khan",
    email: "zara.khan@harvestpro.me",
    phone: "+971 4 555 0165",
    category: "Additives",
    status: "Active",
    location: "Dubai, UAE",
  },
  {
    name: "NutriSource Foods",
    contactPerson: "Oliver Grant",
    email: "oliver.grant@nutrisource.co.uk",
    phone: "+44 161 555 0112",
    category: "Dairy",
    status: "Inactive",
    location: "Manchester, UK",
  },
];

const queries = [
  {
    supplierIndex: 0,
    title: "Confirm sesame allergen handling on roasted seed blend",
    description: "Please confirm whether the roasted seed blend is processed on a shared line with sesame and provide the current allergen control plan.",
    category: "Allergen",
    priority: "Critical",
    status: "Pending",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    referenceProduct: "Roasted Seed Blend A",
    supplierResponse: "",
    internalNotes: [{ text: "High-risk customer line; needs same-day follow-up.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 1,
    title: "Updated BRCGS certificate required for Q3 review",
    description: "Please share the latest BRCGS certificate and confirm whether there have been any non-conformances in the current audit cycle.",
    category: "Certificate",
    priority: "High",
    status: "In Progress",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    referenceProduct: "Whole Grain Oats",
    supplierResponse: "Certificate is with our compliance team and will be shared today.",
    internalNotes: [{ text: "Awaiting document upload.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 2,
    title: "Clarify gluten cross-contact controls in milling process",
    description: "We need confirmation on flour segregation, cleaning validation, and gluten cross-contact controls for the new batch.",
    category: "Ingredient Safety",
    priority: "High",
    status: "Resolved",
    dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    referenceProduct: "Stoneground Flour",
    supplierResponse: "Validated cleaning records and line clearance log have been shared.",
    internalNotes: [{ text: "Resolved after supplier documentation review.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 3,
    title: "COA mismatch for organic spinach lot 2407",
    description: "The certificate of analysis does not list pesticide screening values for the latest organic spinach delivery. Please confirm the missing values.",
    category: "Compliance",
    priority: "Critical",
    status: "Pending",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    referenceProduct: "Organic Spinach",
    supplierResponse: "",
    internalNotes: [],
  },
  {
    supplierIndex: 4,
    title: "Need updated lot traceability records for herbs",
    description: "Please provide traceability records covering farm, packhouse, and transport for the herbal blend supplied last week.",
    category: "Documentation",
    priority: "Medium",
    status: "In Progress",
    dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    referenceProduct: "Herb Blend B",
    supplierResponse: "Traceability pack is being compiled by operations.",
    internalNotes: [{ text: "Supplier acknowledged request.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 5,
    title: "Packaging ink specification for migration testing",
    description: "Confirm the food-contact ink specification and provide migration test evidence for the outer wrap material.",
    category: "Quality",
    priority: "High",
    status: "Resolved",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    referenceProduct: "Outer Wrap Film",
    supplierResponse: "Migration test certificate uploaded to the shared drive.",
    internalNotes: [{ text: "Evidence verified against spec sheet.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 6,
    title: "Review preservative declaration for sauce base",
    description: "Please confirm if the preservative declaration on the sauce base label remains current after the formulation change.",
    category: "Ingredient Safety",
    priority: "Medium",
    status: "Pending",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    referenceProduct: "Tomato Sauce Base",
    supplierResponse: "",
    internalNotes: [],
  },
  {
    supplierIndex: 7,
    title: "Dairy temperature log missing for April shipment",
    description: "The outbound shipment pack is missing the temperature log for the April dairy batch. Please resend the signed records.",
    category: "Documentation",
    priority: "High",
    status: "Pending",
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    referenceProduct: "Cultured Yogurt",
    supplierResponse: "",
    internalNotes: [{ text: "Overdue and waiting on shipment pack.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 0,
    title: "Check for undeclared celery in soup concentrate",
    description: "Please verify whether celery is used in the soup concentrate recipe and confirm label declaration requirements.",
    category: "Allergen",
    priority: "Critical",
    status: "In Progress",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    referenceProduct: "Soup Concentrate",
    supplierResponse: "Recipe review is underway with the R&D team.",
    internalNotes: [],
  },
  {
    supplierIndex: 1,
    title: "Provide updated pesticide residue report",
    description: "The latest grain lot needs a pesticide residue report that references the new testing method and limit thresholds.",
    category: "Compliance",
    priority: "Medium",
    status: "Resolved",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    referenceProduct: "Brown Rice",
    supplierResponse: "Testing report issued and QA approved.",
    internalNotes: [{ text: "Closed after report matched specification.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 2,
    title: "Confirm cleaning validation for wheat line changeover",
    description: "Please share the most recent cleaning validation result for the wheat line before the next production run.",
    category: "Quality",
    priority: "High",
    status: "Pending",
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    referenceProduct: "Soft Wheat Flour",
    supplierResponse: "",
    internalNotes: [],
  },
  {
    supplierIndex: 3,
    title: "Organic certification expiry date confirmation",
    description: "Please confirm the exact expiry date for the organic certification attached to the spinach and kale supply.",
    category: "Certificate",
    priority: "Low",
    status: "Resolved",
    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    referenceProduct: "Spinach and Kale Mix",
    supplierResponse: "Certification renewed and sent to the QA inbox.",
    internalNotes: [],
  },
  {
    supplierIndex: 4,
    title: "Batch label missing harvest region details",
    description: "The batch label on the leafy greens shipment does not include the harvest region required for traceability records.",
    category: "Documentation",
    priority: "High",
    status: "Pending",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    referenceProduct: "Leafy Greens Mix",
    supplierResponse: "",
    internalNotes: [{ text: "Overdue escalation prepared.", author: "QA Manager", createdAt: new Date() }],
  },
  {
    supplierIndex: 5,
    title: "Request plasticizer declaration for tray film",
    description: "Please provide the plasticizer declaration and food-contact compliance statement for the new tray film.",
    category: "Compliance",
    priority: "Medium",
    status: "In Progress",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    referenceProduct: "Tray Film",
    supplierResponse: "Compliance team is finalizing the declaration.",
    internalNotes: [],
  },
  {
    supplierIndex: 6,
    title: "Confirm sulfite declaration threshold on additive blend",
    description: "Need confirmation whether the blend contains sulfites above the declaration threshold before label release.",
    category: "Allergen",
    priority: "Critical",
    status: "Pending",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    referenceProduct: "Seasoning Blend 7",
    supplierResponse: "",
    internalNotes: [],
  },
  {
    supplierIndex: 7,
    title: "Cold-chain evidence missing for yogurt shipment",
    description: "The handover pack is missing the cold-chain evidence sheet. Please confirm temperature monitoring for the shipment.",
    category: "Quality",
    priority: "High",
    status: "Resolved",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    referenceProduct: "Greek Yogurt",
    supplierResponse: "Temperature log attached and approved by logistics.",
    internalNotes: [],
  },
];

const buildTimeline = (status, supplierName, supplierResponse) => {
  const base = [
    {
      status: TIMELINE_EVENTS.SUBMITTED,
      message: `Query raised for ${supplierName}`,
      actor: "QA Manager",
      timestamp: new Date(),
    },
    {
      status: TIMELINE_EVENTS.SENT_TO_SUPPLIER,
      message: `Notification sent to ${supplierName}`,
      actor: "System",
      timestamp: new Date(),
    },
  ];

  if (supplierResponse) {
    base.push({
      status: TIMELINE_EVENTS.SUPPLIER_RESPONSE,
      message: supplierResponse,
      actor: "Supplier",
      timestamp: new Date(),
    });
  }

  if (status === "Resolved") {
    base.push({
      status: TIMELINE_EVENTS.RESOLVED,
      message: "Query resolved",
      actor: "QA Manager",
      timestamp: new Date(),
    });
  }

  return base;
};

const seed = async () => {
  await connectDB();

  await Promise.all([Supplier.deleteMany({}), Query.deleteMany({})]);

  const createdSuppliers = await Supplier.insertMany(suppliers);

  const queryDocs = queries.map((item, index) => {
    const supplier = createdSuppliers[item.supplierIndex];

    return {
      queryId: `QRY-${String(index + 1).padStart(5, "0")}`,
      supplierId: supplier._id,
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      status: item.status,
      dueDate: item.dueDate,
      referenceProduct: item.referenceProduct,
      supplierResponse: item.supplierResponse,
      internalNotes: item.internalNotes,
      timeline: buildTimeline(item.status, supplier.name, item.supplierResponse),
    };
  });

  await Query.insertMany(queryDocs);

  console.log(`Seeded ${createdSuppliers.length} suppliers and ${queryDocs.length} queries`);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
