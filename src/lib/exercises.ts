/**
 * Exercise library with media — pattern like Nike Training Club / Hevy:
 * thumbnail + form cues + external demo (YouTube search / free-exercise-db stills).
 *
 * Images: public-domain-ish free-exercise-db on GitHub.
 */

const FED =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

function fed(folder: string, file = "0.jpg") {
  return `${FED}/${folder}/${file}`;
}

function yt(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${query} proper form tutorial`,
  )}`;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscle: string;
  equipment: "bodyweight" | "dumbbell" | "barbell" | "machine" | "band" | "any";
  jointFriendly: boolean;
  lowImpact: boolean;
  level: "beginner" | "intermediate";
  /** Avoid when these joint zones are flagged */
  avoidJoints?: Array<
    "knee" | "hip" | "shoulder" | "lower_back" | "wrist" | "ankle" | "neck" | "elbow"
  >;
  cues: string[];
  imageUrl: string;
  videoUrl: string;
}

export const EXERCISES: ExerciseTemplate[] = [
  {
    id: "squat",
    name: "Bodyweight / Goblet Squat",
    muscle: "legs",
    equipment: "any",
    jointFriendly: true,
    lowImpact: false,
    level: "beginner",
    avoidJoints: ["knee"],
    cues: ["Ngực mở", "Gối theo hướng mũi chân", "Hạ trong ROM không đau"],
    imageUrl: fed("Bodyweight_Squat"),
    videoUrl: yt("bodyweight squat"),
  },
  {
    id: "rdl",
    name: "Dumbbell Romanian Deadlift",
    muscle: "posterior",
    equipment: "dumbbell",
    jointFriendly: true,
    lowImpact: true,
    level: "intermediate",
    avoidJoints: ["lower_back"],
    cues: ["Hinge háng", "Lưng trung lập", "Cảm giác căng sau đùi"],
    imageUrl: fed("Dumbbell_Romanian_Deadlift"),
    videoUrl: yt("dumbbell romanian deadlift"),
  },
  {
    id: "lunge",
    name: "Walking Lunge",
    muscle: "legs",
    equipment: "any",
    jointFriendly: false,
    lowImpact: false,
    level: "beginner",
    avoidJoints: ["knee", "hip", "ankle"],
    cues: ["Bước vừa", "Thân người thẳng", "Không để gối vượt quá mũi chân mạnh"],
    imageUrl: fed("Bodyweight_Walking_Lunge"),
    videoUrl: yt("walking lunge form"),
  },
  {
    id: "legpress",
    name: "Leg Press",
    muscle: "legs",
    equipment: "machine",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["knee"],
    cues: ["Không khóa gối hết", "Lưng dính ghế", "Kiểm soát nhịp hạ"],
    imageUrl: fed("Leg_Press"),
    videoUrl: yt("leg press proper form"),
  },
  {
    id: "hiphinge",
    name: "Hip Hinge (dowel / light)",
    muscle: "posterior",
    equipment: "any",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["lower_back"],
    cues: ["Đẩy háng ra sau", "Cằm trung lập", "Ít gập lưng"],
    imageUrl: fed("Barbell_Good_Morning"),
    videoUrl: yt("hip hinge drill"),
  },
  {
    id: "pushup",
    name: "Push-up (knee / full)",
    muscle: "chest",
    equipment: "bodyweight",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["wrist", "shoulder"],
    cues: ["Core siết", "Khuỷu ~45°", "Hạ ngực gần sàn trong ROM thoải mái"],
    imageUrl: fed("Push-Up"),
    videoUrl: yt("push up form beginner"),
  },
  {
    id: "dbpress",
    name: "Dumbbell Bench Press",
    muscle: "chest",
    equipment: "dumbbell",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["shoulder", "wrist"],
    cues: ["Xương bả vai rút", "Cổ tay thẳng", "Không nảy tạ"],
    imageUrl: fed("Dumbbell_Bench_Press"),
    videoUrl: yt("dumbbell bench press form"),
  },
  {
    id: "row",
    name: "One-Arm Dumbbell Row",
    muscle: "back",
    equipment: "dumbbell",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["lower_back"],
    cues: ["Kéo khuỷu về hông", "Không xoay thân quá đà", "Siết lưng giữa"],
    imageUrl: fed("Dumbbell_One-Arm_Row"),
    videoUrl: yt("one arm dumbbell row"),
  },
  {
    id: "latpulldown",
    name: "Lat Pulldown",
    muscle: "back",
    equipment: "machine",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["shoulder"],
    cues: ["Kéo về xương đòn", "Ngực mở", "Không dùng đà người"],
    imageUrl: fed("Wide-Grip_Lat_Pulldown"),
    videoUrl: yt("lat pulldown form"),
  },
  {
    id: "ohp",
    name: "Seated Dumbbell Shoulder Press",
    muscle: "shoulders",
    equipment: "dumbbell",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["shoulder", "neck"],
    cues: ["Không ưỡn thắt lưng", "Đẩy thẳng trên đầu", "Hạ có kiểm soát"],
    imageUrl: fed("Dumbbell_Shoulder_Press"),
    videoUrl: yt("seated dumbbell shoulder press"),
  },
  {
    id: "lateral",
    name: "Dumbbell Lateral Raise",
    muscle: "shoulders",
    equipment: "dumbbell",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["shoulder"],
    cues: ["Tạ nhẹ", "Khuỷu hơi cong", "Không nâng quá vai nếu đau"],
    imageUrl: fed("Dumbbell_Lateral_Raise"),
    videoUrl: yt("dumbbell lateral raise form"),
  },
  {
    id: "curl",
    name: "Dumbbell Bicep Curl",
    muscle: "arms",
    equipment: "dumbbell",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["elbow", "wrist"],
    cues: ["Khuỷu sát thân", "Không đánh đà", "Siết đỉnh chuyển động"],
    imageUrl: fed("Dumbbell_Bicep_Curl"),
    videoUrl: yt("dumbbell curl form"),
  },
  {
    id: "triceps",
    name: "Triceps Pushdown / Extension",
    muscle: "arms",
    equipment: "any",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["elbow", "shoulder"],
    cues: ["Khuỷu cố định", "Duỗi hết nhưng không khóa đau"],
    imageUrl: fed("Triceps_Pushdown"),
    videoUrl: yt("triceps pushdown form"),
  },
  {
    id: "plank",
    name: "Plank",
    muscle: "core",
    equipment: "bodyweight",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["lower_back", "wrist"],
    cues: ["Thẳng từ đầu đến gót", "Không võng lưng", "Thở đều"],
    imageUrl: fed("Plank"),
    videoUrl: yt("plank form"),
  },
  {
    id: "deadbug",
    name: "Dead Bug",
    muscle: "core",
    equipment: "bodyweight",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    cues: ["Ép lưng xuống sàn", "Chậm và đối xứng", "Thở ra khi duỗi"],
    imageUrl: fed("Dead_Bug"),
    videoUrl: yt("dead bug exercise"),
  },
  {
    id: "bird",
    name: "Bird Dog",
    muscle: "core",
    equipment: "bodyweight",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["wrist", "knee"],
    cues: ["Không xoay hông", "Duỗi đối diện", "Giữ thăng bằng"],
    imageUrl: fed("Bird_Dog"),
    videoUrl: yt("bird dog exercise"),
  },
  {
    id: "glutebridge",
    name: "Glute Bridge",
    muscle: "posterior",
    equipment: "bodyweight",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["lower_back"],
    cues: ["Siết mông đỉnh", "Không ưỡn thắt lưng", "Hạ chậm"],
    imageUrl: fed("Glute_Bridge"),
    videoUrl: yt("glute bridge form"),
  },
  {
    id: "stepup",
    name: "Step-up",
    muscle: "legs",
    equipment: "any",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["knee", "ankle"],
    cues: ["Đẩy gót chân trước", "Thân hơi nghiêng", "Bậc không quá cao"],
    imageUrl: fed("Step-up"),
    videoUrl: yt("step up exercise form"),
  },
  {
    id: "farmers",
    name: "Farmer Carry",
    muscle: "full",
    equipment: "dumbbell",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["wrist", "lower_back"],
    cues: ["Vai hạ", "Bước ngắn vững", "Core siết"],
    imageUrl: fed("Farmers_Walk"),
    videoUrl: yt("farmer walk form"),
  },
  {
    id: "bike",
    name: "Steady Bike / Brisk Walk",
    muscle: "cardio",
    equipment: "any",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    cues: ["Nói chuyện được (Zone 2)", "Không gắng sức nếu chóng mặt"],
    imageUrl: fed("Recumbent_Bike"),
    videoUrl: yt("zone 2 cardio walk bike"),
  },
  {
    id: "wallsit",
    name: "Wall Sit",
    muscle: "legs",
    equipment: "bodyweight",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["knee"],
    cues: ["Đùi song song nếu được", "Lưng dính tường", "Thở đều"],
    imageUrl: fed("Wall_Sit"),
    videoUrl: yt("wall sit exercise"),
  },
  {
    id: "chestfly",
    name: "Dumbbell Fly (light)",
    muscle: "chest",
    equipment: "dumbbell",
    jointFriendly: false,
    lowImpact: true,
    level: "intermediate",
    avoidJoints: ["shoulder"],
    cues: ["Tạ nhẹ", "Khuỷu mềm", "Không hạ quá sâu nếu đau vai"],
    imageUrl: fed("Dumbbell_Flyes"),
    videoUrl: yt("dumbbell fly form"),
  },
  {
    id: "bandrow",
    name: "Band / Seated Cable Row",
    muscle: "back",
    equipment: "band",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    cues: ["Kéo khuỷu về sau", "Ngực mở", "Siết xương bả"],
    imageUrl: fed("Seated_Cable_Rows"),
    videoUrl: yt("seated cable row form"),
  },
  {
    id: "boxsquat",
    name: "Box / Chair Squat",
    muscle: "legs",
    equipment: "any",
    jointFriendly: true,
    lowImpact: true,
    level: "beginner",
    avoidJoints: ["knee"],
    cues: ["Chạm ghế nhẹ", "Không plop mạnh", "An toàn hơn squat tự do khi đau gối"],
    imageUrl: fed("Barbell_Squat_To_A_Bench"),
    videoUrl: yt("box squat form"),
  },
];

export function pickByMuscle(
  muscle: string,
  opts: {
    jointSafe?: boolean;
    lowImpact?: boolean;
    avoidJoints?: string[];
  },
  count: number,
): ExerciseTemplate[] {
  let pool = EXERCISES.filter((e) => e.muscle === muscle || muscle === "full");
  if (opts.jointSafe) pool = pool.filter((e) => e.jointFriendly);
  if (opts.lowImpact) pool = pool.filter((e) => e.lowImpact);
  if (opts.avoidJoints?.length) {
    pool = pool.filter(
      (e) =>
        !e.avoidJoints?.some((j) => opts.avoidJoints!.includes(j)),
    );
  }
  if (pool.length === 0) {
    pool = EXERCISES.filter((e) => e.jointFriendly && e.lowImpact);
  }
  // Prefer variety: shuffle lightly by id hash
  return [...pool].sort((a, b) => a.id.localeCompare(b.id)).slice(0, count);
}

export function getExercise(id: string): ExerciseTemplate | undefined {
  return EXERCISES.find((e) => e.id === id);
}
