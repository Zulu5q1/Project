import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("Seeding database...");

  const universities = [
    {
      name: "Landmark University",
      shortName: "LMU",
      description: "A private Christian university established in 2011, located in Omu-Aran, Kwara State.",
      location: "Omu-Aran, Kwara State, Nigeria",
      website: "https://www.landmarkuniversity.edu.ng",
      campuses: [
        { name: "Main Campus", location: "Omu-Aran, Kwara State" },
      ],
    },
    {
      name: "University of Lagos",
      shortName: "UNILAG",
      description: "A premier federal university established in 1962, located in Akoka, Lagos.",
      location: "Akoka, Yaba, Lagos, Nigeria",
      website: "https://www.unilag.edu.ng",
      campuses: [
        { name: "Main Campus", location: "Akoka, Yaba, Lagos" },
        { name: "College of Medicine", location: "Idi-Araba, Lagos" },
      ],
    },
    {
      name: "Covenant University",
      shortName: "CU",
      description: "A private Christian university established in 2002, located in Ota, Ogun State.",
      location: "Ota, Ogun State, Nigeria",
      website: "https://www.covenantuniversity.edu.ng",
      campuses: [
        { name: "Main Campus", location: "Ota, Ogun State" },
      ],
    },
    {
      name: "University of Ibadan",
      shortName: "UI",
      description: "The oldest university in Nigeria, established in 1948, located in Ibadan, Oyo State.",
      location: "Oduduwa Road, Ibadan, Oyo State, Nigeria",
      website: "https://www.ui.edu.ng",
      campuses: [
        { name: "Main Campus", location: "Oduduwa Road, Ibadan" },
        { name: "College of Medicine", location: "University College Hospital, Ibadan" },
      ],
    },
    {
      name: "University of Nigeria, Nsukka",
      shortName: "UNN",
      description: "A federal university established in 1960, located in Nsukka, Enugu State.",
      location: "Nsukka, Enugu State, Nigeria",
      website: "https://www.unn.edu.ng",
      campuses: [
        { name: "Nsukka Campus", location: "Nsukka, Enugu State" },
        { name: "Enugu Campus", location: "Enugu, Enugu State" },
      ],
    },
  ];

  for (const uni of universities) {
    const created = await prisma.university.upsert({
      where: { name: uni.name },
      update: {
        shortName: uni.shortName,
        description: uni.description,
        location: uni.location,
        website: uni.website,
      },
      create: {
        name: uni.name,
        shortName: uni.shortName,
        description: uni.description,
        location: uni.location,
        website: uni.website,
      },
    });

    for (const campus of uni.campuses) {
      await prisma.campus.upsert({
        where: { name_universityId: { name: campus.name, universityId: created.id } },
        update: { location: campus.location },
        create: {
          name: campus.name,
          universityId: created.id,
          location: campus.location,
        },
      });
    }
  }

  const categories = [
    { name: "Electronics", description: "Phones, laptops, tablets, accessories, gaming, audio" },
    { name: "Fashion", description: "Clothing, shoes, bags, accessories" },
    { name: "Books & Academics", description: "Textbooks, course materials, past questions, stationery" },
    { name: "Hostel & Living", description: "Furniture, kitchen items, bedding, appliances, decorations" },
    { name: "Food", description: "Snacks, drinks, meals, homemade food" },
    { name: "Beauty", description: "Hair, skincare, cosmetics, barbering" },
    { name: "Services", description: "Graphics design, photography, tutoring, programming, writing, repairs, cleaning" },
    { name: "Other", description: "Miscellaneous items" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
      },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@unixchange.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const adminLastName = process.env.ADMIN_LAST_NAME || "User";

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const unilag = await prisma.university.findUnique({ where: { name: "University of Lagos" } });
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      firstName: adminFirstName,
      lastName: adminLastName,
      username: adminUsername,
      role: "ADMIN",
      universityId: unilag?.id || null,
    },
  });
  console.log(`Admin account: ${adminEmail} (role: ADMIN) — development only`);

  const studentEmail = process.env.STUDENT_EMAIL || "student@unixchange.com";
  const studentPassword = process.env.STUDENT_PASSWORD || "student123";
  const studentUsername = process.env.STUDENT_USERNAME || "student";

  const studentHash = await bcrypt.hash(studentPassword, 12);
  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      passwordHash: studentHash,
      firstName: "Demo",
      lastName: "Student",
      username: studentUsername,
      role: "STUDENT",
      universityId: unilag?.id || null,
    },
  });
  console.log(`Student account: ${studentEmail} (role: STUDENT) — development only`);

  const electronicsCategory = await prisma.category.findUnique({ where: { slug: "electronics" } });
  const fashionCategory = await prisma.category.findUnique({ where: { slug: "fashion" } });
  const booksCategory = await prisma.category.findUnique({ where: { slug: "books-academics" } });
  const hostelCategory = await prisma.category.findUnique({ where: { slug: "hostel-living" } });

  const unilagMainCampus = unilag
    ? await prisma.campus.findFirst({ where: { universityId: unilag.id, name: "Main Campus" } })
    : null;

  if (unilag && unilagMainCampus && electronicsCategory && fashionCategory && booksCategory && hostelCategory) {
    const demoListings = [
      {
        title: "iPhone 13 Pro — Space Gray",
        description: "Selling my iPhone 13 Pro in excellent condition. 256GB storage, battery health at 92%. Comes with original charger and box.",
        price: 350000,
        condition: "LIKE_NEW" as const,
        categoryId: electronicsCategory.id,
        universityId: unilag.id,
        campusId: unilagMainCampus.id,
        sellerId: student.id,
        location: "Akoka, Lagos",
      },
      {
        title: "Calculus Textbook — Stewart 8th Edition",
        description: "Used calculus textbook in good condition. Some highlighting on first 3 chapters. Great for MTH101/102 students.",
        price: 5000,
        condition: "GOOD" as const,
        categoryId: booksCategory.id,
        universityId: unilag.id,
        campusId: unilagMainCampus.id,
        sellerId: student.id,
        location: "Main Campus",
      },
      {
        title: "Nike Air Max 90 — Size 43",
        description: "Nike Air Max 90, barely worn. Bought online but they're slightly too small. White/gray colorway.",
        price: 25000,
        condition: "LIKE_NEW" as const,
        categoryId: fashionCategory.id,
        universityId: unilag.id,
        campusId: unilagMainCampus.id,
        sellerId: student.id,
        location: "Yaba, Lagos",
      },
      {
        title: "Standing Fan — LG 16 inch",
        description: "Working standing fan, selling because I'm graduating. Includes remote control.",
        price: 8000,
        condition: "FAIR" as const,
        categoryId: hostelCategory.id,
        universityId: unilag.id,
        campusId: unilagMainCampus.id,
        sellerId: student.id,
        location: "Student Village, UNILAG",
      },
    ];

    for (const listing of demoListings) {
      const existing = await prisma.listing.findFirst({
        where: { title: listing.title, sellerId: listing.sellerId },
      });
      if (!existing) {
        await prisma.listing.create({ data: listing });
      }
    }
    console.log(`Seeded ${demoListings.length} demo listings.`);
  }

  const universityCount = await prisma.university.count();
  const campusCount = await prisma.campus.count();
  const categoryCount = await prisma.category.count();
  const listingCount = await prisma.listing.count();
  console.log(`Seed completed. ${universityCount} universities, ${campusCount} campuses, ${categoryCount} categories, ${listingCount} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
