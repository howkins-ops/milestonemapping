import { uid } from "./id.js";
import { getTodayKey } from "./dates.js";

function action(weekNumber, text, done = false) {
  return {
    id: uid("act"),
    weekNumber,
    text,
    done,
    createdAt: new Date().toISOString(),
    completedAt: done ? new Date().toISOString() : null
  };
}

function futureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return getTodayKey(d);
}

function milestone(projectId, data) {
  return {
    id: uid("ms"),
    projectId,
    title: "",
    category: "Personal Growth",
    description: "",
    whyItMatters: "",
    futureVision: "",
    oldIdentity: "",
    newIdentity: "",
    targetDate: "",
    priority: "medium",
    status: "active",
    rewardSmall: "",
    rewardMedium: "",
    rewardLarge: "",
    actions: [],
    notes: "",
    createdAt: new Date().toISOString(),
    completedAt: null,
    rewardsClaimed: { small: false, medium: false, large: false },
    ...data
  };
}

// Optional starter data — only loaded when the user clicks "Load Example Mission Map".
export function buildSampleData() {
  const appProject = {
    id: uid("proj"),
    title: "Launch My Dream App",
    category: "Business",
    icon: "🚀",
    color: "cyan",
    description: "Take the app from idea to real users.",
    whyItMatters:
      "Every month I wait, someone with less skill ships first. This is the proof that I build instead of talk.",
    futureVision:
      "I open my phone and see real users inside something I built from nothing. I am a founder with a shipped product, not an idea collector.",
    targetDate: futureDate(120),
    status: "active",
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  const bodyProject = {
    id: uid("proj"),
    title: "Total Body Transformation",
    category: "Fitness",
    icon: "🔥",
    color: "pink",
    description: "Drop 20 lbs and make training automatic.",
    whyItMatters:
      "My energy is my engine. When my body is weak, every other mission slows down with it.",
    futureVision:
      "I catch my reflection and see someone disciplined. Clothes fit. Mornings start with power instead of snooze.",
    targetDate: futureDate(150),
    status: "active",
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  const milestones = [
    milestone(appProject.id, {
      title: "Design the MVP",
      category: "Business",
      priority: "high",
      status: "completed",
      completedAt: new Date().toISOString(),
      whyItMatters: "A clear spec kills scope creep before it starts.",
      rewardSmall: "Fancy coffee on launch-spec day",
      rewardMedium: "New design book",
      rewardLarge: "Mechanical keyboard",
      actions: [
        action(1, "Write the one-page product spec", true),
        action(1, "Sketch the 5 core screens", true),
        action(2, "Pick the tech stack and lock it", true)
      ]
    }),
    milestone(appProject.id, {
      title: "Build Core Features",
      category: "Business",
      priority: "mission_critical",
      whyItMatters: "Nothing exists until the core loop works end-to-end.",
      rewardSmall: "Movie night, guilt-free",
      rewardMedium: "Upgrade dev monitor",
      rewardLarge: "Weekend off, fully unplugged",
      actions: [
        action(2, "Build the home screen UI", true),
        action(2, "Wire up local data persistence", true),
        action(3, "Implement the core user flow"),
        action(3, "Fix the top 3 known bugs")
      ]
    }),
    milestone(appProject.id, {
      title: "Private Beta",
      category: "Business",
      priority: "high",
      whyItMatters: "Real feedback beats imagined perfection.",
      rewardSmall: "Steak dinner after first beta invite",
      rewardMedium: "New backpack",
      rewardLarge: "Cabin weekend to plan v2",
      actions: [
        action(4, "Send beta link to 5 friends"),
        action(4, "Collect structured feedback"),
        action(5, "Ship top 3 fixes from feedback")
      ]
    }),
    milestone(appProject.id, {
      title: "Public Launch",
      category: "Business",
      priority: "mission_critical",
      whyItMatters: "Shipped beats perfect. The world only counts what's public.",
      rewardSmall: "Launch-day celebration dinner",
      rewardMedium: "New phone",
      rewardLarge: "Upgrade my entire desk setup",
      actions: [
        action(6, "Write the launch post"),
        action(6, "Publish to the store / web"),
        action(7, "Share with 50 people")
      ]
    }),

    milestone(bodyProject.id, {
      title: "Build the Training Habit",
      category: "Fitness",
      priority: "high",
      whyItMatters: "Consistency before intensity. The habit is the foundation.",
      rewardSmall: "New training playlist + earbuds case",
      rewardMedium: "New training shoes",
      rewardLarge: "Full new gym wardrobe",
      actions: [
        action(1, "Schedule 4 workouts in the calendar", true),
        action(1, "Plan meals for the first 5 days"),
        action(2, "Complete all 4 sessions this week"),
        action(2, "Track morning weight daily")
      ]
    }),
    milestone(bodyProject.id, {
      title: "First 10 lbs Down",
      category: "Fitness",
      priority: "medium",
      whyItMatters: "The first visible win makes the rest believable.",
      rewardSmall: "Cheat meal, earned not stolen",
      rewardMedium: "Massage session",
      rewardLarge: "New jeans one size down",
      actions: [
        action(3, "Add one extra cardio session weekly"),
        action(3, "Cut liquid calories completely"),
        action(4, "Weekly progress photo + measurements")
      ]
    }),
    milestone(bodyProject.id, {
      title: "Peak Condition",
      category: "Fitness",
      priority: "high",
      whyItMatters: "This is the version of me that shows up everywhere stronger.",
      rewardSmall: "Pro gym gloves",
      rewardMedium: "Fitness watch upgrade",
      rewardLarge: "Beach trip in the best shape of my life",
      actions: [
        action(5, "Hit 4 strength PRs"),
        action(6, "Run 5K without stopping"),
        action(7, "Maintain target weight for 3 weeks")
      ]
    })
  ];

  return { projects: [appProject, bodyProject], milestones };
}
