import { db } from "./db";
import { services, availableSlots, insertServiceSchema, insertAvailableSlotSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
async function seed() {
    console.log("Seeding database with initial data...");
    // Add services
    const servicesList = [
        {
            title: "Kundalini Awakening Consultation",
            description: "A personalized session to help understand and guide your Kundalini awakening journey, addressing energy blocks and providing practices for safe awakening.",
            image: "kundalini.svg", // Default placeholder image
            price: 120,
            duration: 60,
            isActive: true
        },
        {
            title: "Sound Healing Session",
            description: "Experience the therapeutic benefits of sound vibrations using singing bowls, tuning forks, and other instruments to promote deep relaxation and energy balance.",
            image: "sound-healing.svg", // Default placeholder image
            price: 95,
            duration: 45,
            isActive: true
        },
        {
            title: "Plant Medicine Integration",
            description: "Support for integrating insights from plant medicine journeys into your daily life, helping you process experiences and implement lasting positive changes.",
            image: "plant-medicine.svg", // Default placeholder image
            price: 150,
            duration: 90,
            isActive: true
        },
        {
            title: "Spiritual Alignment Session",
            description: "A comprehensive consultation to help align your spiritual practices with your true self, identifying blockages and creating a path forward for deeper connection.",
            image: "spiritual-alignment.svg", // Default placeholder image
            price: 110,
            duration: 60,
            isActive: true
        }
    ];
    for (const service of servicesList) {
        try {
            const result = insertServiceSchema.safeParse(service);
            if (!result.success) {
                console.error("Invalid service data:", result.error.errors);
                continue;
            }
            // Check if service already exists to avoid duplicates
            const existingServices = await db
                .select()
                .from(services)
                .where(eq(services.title, service.title));
            if (existingServices.length === 0) {
                await db.insert(services).values(service);
                console.log(`Added service: ${service.title}`);
            }
            else {
                console.log(`Service already exists: ${service.title}`);
            }
        }
        catch (error) {
            console.error("Error adding service:", error);
        }
    }
    // Add available slots for the next 7 days
    const today = new Date();
    const times = ["09:00", "11:00", "13:00", "15:00", "17:00"];
    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        for (const startTime of times) {
            // Calculate end time (start time + 1 hour)
            const [startHour, startMinute] = startTime.split(':').map(Number);
            let endHour = startHour + 1;
            const endMinute = startMinute;
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
            const slot = {
                date: dateStr,
                startTime,
                endTime,
                isBooked: false
            };
            try {
                const result = insertAvailableSlotSchema.safeParse(slot);
                if (!result.success) {
                    console.error("Invalid slot data:", result.error.errors);
                    continue;
                }
                // Check if slot already exists to avoid duplicates
                const existingSlots = await db
                    .select()
                    .from(availableSlots)
                    .where(and(eq(availableSlots.date, slot.date), eq(availableSlots.startTime, slot.startTime)));
                if (existingSlots.length === 0) {
                    await db.insert(availableSlots).values(slot);
                    console.log(`Added slot: ${slot.date} ${slot.startTime}-${slot.endTime}`);
                }
                else {
                    console.log(`Slot already exists: ${slot.date} ${slot.startTime}-${slot.endTime}`);
                }
            }
            catch (error) {
                console.error("Error adding slot:", error);
            }
        }
    }
    console.log("Seeding completed!");
}
seed()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
