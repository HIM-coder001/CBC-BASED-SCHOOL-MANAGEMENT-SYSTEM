/**
 * Full CBC Curriculum — Upper Primary (Grade 4–6) + Junior Secondary (Grade 7–9)
 * Structure: LearningArea → Strands → SubStrands
 */

export const CBC_CURRICULUM = [

  // LOWER PRIMARY — Grades 1–3 (foundation)
  {
    name: "English", grade: "1",
    strands: [
      { name: "Listening and Speaking", subStrands: ["Listening", "Speaking"] },
      { name: "Reading", subStrands: ["Letter Recognition", "Simple Words"] },
      { name: "Writing", subStrands: ["Handwriting", "Simple Sentences"] },
    ],
  },
  {
    name: "Kiswahili", grade: "1",
    strands: [
      { name: "Kusikiliza na Kuzungumza", subStrands: ["Kusikiliza", "Kuzungumza"] },
      { name: "Kusoma", subStrands: ["Herufi", "Maneno Rahisi"] },
    ],
  },
  {
    name: "Mathematics", grade: "1",
    strands: [
      { name: "Numbers", subStrands: ["Counting", "Number Recognition"] },
      { name: "Measurement", subStrands: ["Length", "Mass"] },
    ],
  },
  {
    name: "English", grade: "2",
    strands: [
      { name: "Reading", subStrands: ["Fluency", "Comprehension"] },
      { name: "Writing", subStrands: ["Sentences", "Paragraphs"] },
    ],
  },
  {
    name: "Mathematics", grade: "2",
    strands: [
      { name: "Numbers", subStrands: ["Addition", "Subtraction"] },
    ],
  },
  {
    name: "English", grade: "3",
    strands: [
      { name: "Reading", subStrands: ["Comprehension", "Vocabulary"] },
      { name: "Writing", subStrands: ["Creative Writing", "Grammar"] },
    ],
  },
  {
    name: "Mathematics", grade: "3",
    strands: [
      { name: "Numbers", subStrands: ["Multiplication", "Division"] },
    ],
  },

  // UPPER PRIMARY — Grade 4
   
  {
    name: "English", grade: "4",
    strands: [
      { name: "Listening and Speaking", subStrands: ["Listening Comprehension", "Oral Presentation", "Conversation Skills", "Pronunciation and Intonation"] },
      { name: "Reading", subStrands: ["Phonics and Word Recognition", "Reading Fluency", "Reading Comprehension", "Vocabulary Development"] },
      { name: "Writing", subStrands: ["Handwriting", "Sentence Construction", "Paragraph Writing", "Creative Writing"] },
      { name: "Grammar and Language Use", subStrands: ["Parts of Speech", "Tenses", "Punctuation", "Sentence Structure"] },
    ],
  },
  {
    name: "Kiswahili", grade: "4",
    strands: [
      { name: "Kusikiliza na Kuzungumza", subStrands: ["Usikilizaji", "Mazungumzo", "Matamshi", "Hadithi"] },
      { name: "Kusoma", subStrands: ["Usomaji wa Haraka", "Ufahamu wa Kusoma", "Msamiati"] },
      { name: "Kuandika", subStrands: ["Uandishi wa Maandishi", "Insha", "Sarufi katika Uandishi"] },
      { name: "Sarufi", subStrands: ["Nomino", "Vitenzi", "Vivumishi", "Viunganishi"] },
    ],
  },
  {
    name: "Mathematics", grade: "4",
    strands: [
      { name: "Numbers", subStrands: ["Whole Numbers", "Fractions", "Decimals", "Percentages"] },
      { name: "Measurement", subStrands: ["Length", "Mass", "Capacity", "Time", "Area and Perimeter"] },
      { name: "Geometry", subStrands: ["2D Shapes", "3D Objects", "Lines and Angles"] },
      { name: "Data Handling", subStrands: ["Collecting Data", "Representing Data", "Interpreting Data"] },
    ],
  },
  {
    name: "Science and Technology", grade: "4",
    strands: [
      { name: "Living Things", subStrands: ["Plants", "Animals", "Human Body", "Ecosystems"] },
      { name: "Non-Living Things", subStrands: ["Matter and Materials", "Forces and Energy", "Water"] },
      { name: "Technology", subStrands: ["Simple Machines", "ICT Basics", "Innovation and Design"] },
    ],
  },
  {
    name: "Social Studies", grade: "4",
    strands: [
      { name: "Our Environment", subStrands: ["Physical Features", "Climate and Weather", "Natural Resources"] },
      { name: "Our Community", subStrands: ["Family and Community", "Culture and Heritage", "Civic Responsibility"] },
      { name: "History and Government", subStrands: ["Kenya's History", "Government Structures", "National Values"] },
    ],
  },
  {
    name: "Religious Education", grade: "4",
    strands: [
      { name: "Christian Religious Education", subStrands: ["Creation", "The Bible", "Jesus Christ", "Christian Living"] },
      { name: "Islamic Religious Education", subStrands: ["Quran", "Pillars of Islam", "Islamic Values", "Prophet Muhammad"] },
      { name: "Hindu Religious Education", subStrands: ["Hindu Scriptures", "Hindu Values", "Worship", "Festivals"] },
    ],
  },
  {
    name: "Agriculture and Nutrition", grade: "4",
    strands: [
      { name: "Agriculture", subStrands: ["Crop Production", "Animal Husbandry", "Soil and Water Conservation"] },
      { name: "Nutrition", subStrands: ["Food Groups", "Balanced Diet", "Food Preparation", "Food Safety"] },
    ],
  },
  {
    name: "Creative Arts", grade: "4",
    strands: [
      { name: "Visual Arts", subStrands: ["Drawing and Painting", "Craft", "Sculpture"] },
      { name: "Performing Arts", subStrands: ["Music", "Dance", "Drama"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UPPER PRIMARY — Grade 5
   

  {
    name: "English", grade: "5",
    strands: [
      { name: "Listening and Speaking", subStrands: ["Listening Comprehension", "Oral Presentation", "Debate and Discussion", "Pronunciation"] },
      { name: "Reading", subStrands: ["Reading Fluency", "Reading Comprehension", "Vocabulary Development", "Critical Reading"] },
      { name: "Writing", subStrands: ["Composition Writing", "Letter Writing", "Creative Writing", "Report Writing"] },
      { name: "Grammar and Language Use", subStrands: ["Parts of Speech", "Tenses", "Punctuation", "Direct and Indirect Speech"] },
    ],
  },
  {
    name: "Kiswahili", grade: "5",
    strands: [
      { name: "Kusikiliza na Kuzungumza", subStrands: ["Usikilizaji", "Mazungumzo", "Mjadala", "Hadithi"] },
      { name: "Kusoma", subStrands: ["Usomaji wa Haraka", "Ufahamu", "Msamiati", "Usomaji wa Kina"] },
      { name: "Kuandika", subStrands: ["Insha", "Barua", "Ripoti", "Uandishi wa Ubunifu"] },
      { name: "Sarufi", subStrands: ["Nomino", "Vitenzi", "Vivumishi", "Sentensi"] },
    ],
  },
  {
    name: "Mathematics", grade: "5",
    strands: [
      { name: "Numbers", subStrands: ["Whole Numbers", "Fractions", "Decimals", "Percentages", "Ratio and Proportion"] },
      { name: "Measurement", subStrands: ["Length", "Mass", "Capacity", "Time", "Area and Perimeter", "Volume"] },
      { name: "Geometry", subStrands: ["2D Shapes", "3D Objects", "Lines and Angles", "Symmetry"] },
      { name: "Data Handling", subStrands: ["Collecting Data", "Frequency Tables", "Bar Graphs", "Pie Charts"] },
    ],
  },
  {
    name: "Science and Technology", grade: "5",
    strands: [
      { name: "Living Things", subStrands: ["Classification of Living Things", "Nutrition in Plants", "Nutrition in Animals", "Reproduction"] },
      { name: "Non-Living Things", subStrands: ["States of Matter", "Heat and Temperature", "Light", "Sound"] },
      { name: "Technology", subStrands: ["Simple Machines", "Electricity Basics", "ICT Applications"] },
    ],
  },
  {
    name: "Social Studies", grade: "5",
    strands: [
      { name: "Our Environment", subStrands: ["Landforms", "Climate Zones", "Natural Resources", "Environmental Conservation"] },
      { name: "Our Community", subStrands: ["Cultural Diversity", "Economic Activities", "Trade and Commerce"] },
      { name: "History and Government", subStrands: ["Pre-Colonial Kenya", "Colonial Period", "Independence", "Constitution"] },
    ],
  },
  {
    name: "Religious Education", grade: "5",
    strands: [
      { name: "Christian Religious Education", subStrands: ["Old Testament", "New Testament", "Christian Values", "Prayer and Worship"] },
      { name: "Islamic Religious Education", subStrands: ["Quran Recitation", "Hadith", "Islamic History", "Moral Values"] },
      { name: "Hindu Religious Education", subStrands: ["Vedas", "Hindu Deities", "Dharma", "Festivals and Celebrations"] },
    ],
  },
  {
    name: "Agriculture and Nutrition", grade: "5",
    strands: [
      { name: "Agriculture", subStrands: ["Crop Husbandry", "Livestock Keeping", "Horticulture", "Soil Management"] },
      { name: "Nutrition", subStrands: ["Nutrients and Functions", "Meal Planning", "Food Preservation", "Hygiene"] },
    ],
  },
  {
    name: "Creative Arts", grade: "5",
    strands: [
      { name: "Visual Arts", subStrands: ["Drawing", "Painting", "Printmaking", "Textile Art"] },
      { name: "Performing Arts", subStrands: ["Vocal Music", "Instrumental Music", "Dance Forms", "Drama and Theatre"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // UPPER PRIMARY — Grade 6
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "English", grade: "6",
    strands: [
      { name: "Listening and Speaking", subStrands: ["Listening Comprehension", "Public Speaking", "Debate", "Storytelling"] },
      { name: "Reading", subStrands: ["Reading Fluency", "Comprehension Strategies", "Literary Analysis", "Research Skills"] },
      { name: "Writing", subStrands: ["Essay Writing", "Creative Writing", "Formal Letters", "Research Writing"] },
      { name: "Grammar and Language Use", subStrands: ["Advanced Grammar", "Figurative Language", "Vocabulary", "Editing"] },
    ],
  },
  {
    name: "Kiswahili", grade: "6",
    strands: [
      { name: "Kusikiliza na Kuzungumza", subStrands: ["Usikilizaji wa Kina", "Hotuba", "Mjadala", "Usimulizi"] },
      { name: "Kusoma", subStrands: ["Usomaji wa Haraka", "Ufahamu wa Kina", "Uchambuzi wa Fasihi"] },
      { name: "Kuandika", subStrands: ["Insha za Hoja", "Barua Rasmi", "Ripoti", "Utafiti"] },
      { name: "Sarufi", subStrands: ["Sarufi ya Juu", "Lugha ya Picha", "Msamiati wa Juu"] },
    ],
  },
  {
    name: "Mathematics", grade: "6",
    strands: [
      { name: "Numbers", subStrands: ["Integers", "Fractions and Decimals", "Percentages", "Ratio and Proportion", "Squares and Square Roots"] },
      { name: "Measurement", subStrands: ["Length and Distance", "Mass and Weight", "Capacity and Volume", "Time", "Area", "Perimeter"] },
      { name: "Geometry", subStrands: ["Angles", "Triangles", "Quadrilaterals", "Circles", "3D Shapes"] },
      { name: "Algebra", subStrands: ["Patterns and Sequences", "Simple Equations", "Expressions"] },
      { name: "Data Handling", subStrands: ["Mean, Mode, Median", "Graphs", "Probability Basics"] },
    ],
  },
  {
    name: "Science and Technology", grade: "6",
    strands: [
      { name: "Living Things", subStrands: ["Cell Structure", "Photosynthesis", "Respiration", "Reproduction in Plants", "Reproduction in Animals"] },
      { name: "Non-Living Things", subStrands: ["Mixtures and Solutions", "Acids and Bases", "Electricity", "Magnetism"] },
      { name: "Technology", subStrands: ["Computer Applications", "Internet Safety", "Simple Programming", "Innovation"] },
    ],
  },
  {
    name: "Social Studies", grade: "6",
    strands: [
      { name: "Our Environment", subStrands: ["Map Reading", "Climate Change", "Sustainable Development"] },
      { name: "Our Community", subStrands: ["Governance", "Human Rights", "Gender and Inclusion"] },
      { name: "History and Government", subStrands: ["African History", "Kenya's Government", "Regional and Global Organizations"] },
    ],
  },
  {
    name: "Religious Education", grade: "6",
    strands: [
      { name: "Christian Religious Education", subStrands: ["Prophets", "Miracles of Jesus", "The Church", "Christian Ethics"] },
      { name: "Islamic Religious Education", subStrands: ["Fiqh", "Seerah", "Islamic Ethics", "Community Service"] },
      { name: "Hindu Religious Education", subStrands: ["Karma and Dharma", "Hindu Philosophy", "Service to Society"] },
    ],
  },
  {
    name: "Agriculture and Nutrition", grade: "6",
    strands: [
      { name: "Agriculture", subStrands: ["Crop Diseases and Pests", "Irrigation", "Agribusiness", "Environmental Conservation"] },
      { name: "Nutrition", subStrands: ["Nutritional Disorders", "Special Diets", "Food Technology", "Consumer Education"] },
    ],
  },
  {
    name: "Creative Arts", grade: "6",
    strands: [
      { name: "Visual Arts", subStrands: ["Advanced Drawing", "Mixed Media", "Digital Art Basics", "Art Appreciation"] },
      { name: "Performing Arts", subStrands: ["Choral Music", "Composition", "Contemporary Dance", "Script Writing"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // JUNIOR SECONDARY — Grade 7
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "English", grade: "7",
    strands: [
      { name: "Listening and Speaking", subStrands: ["Listening for Information", "Formal Presentations", "Debate and Argumentation"] },
      { name: "Reading", subStrands: ["Comprehension", "Literary Texts", "Informational Texts", "Critical Reading"] },
      { name: "Writing", subStrands: ["Argumentative Writing", "Narrative Writing", "Expository Writing", "Research Writing"] },
      { name: "Language Use", subStrands: ["Grammar in Context", "Vocabulary Enrichment", "Stylistic Devices"] },
    ],
  },
  {
    name: "Kiswahili", grade: "7",
    strands: [
      { name: "Kusikiliza na Kuzungumza", subStrands: ["Usikilizaji wa Habari", "Uwasilishaji Rasmi", "Mjadala"] },
      { name: "Kusoma", subStrands: ["Ufahamu", "Fasihi", "Usomaji wa Kina"] },
      { name: "Kuandika", subStrands: ["Insha za Hoja", "Uandishi wa Ubunifu", "Utafiti"] },
      { name: "Sarufi na Matumizi ya Lugha", subStrands: ["Sarufi ya Juu", "Msamiati", "Mitindo ya Lugha"] },
    ],
  },
  {
    name: "Mathematics", grade: "7",
    strands: [
      { name: "Numbers", subStrands: ["Integers", "Rational Numbers", "Irrational Numbers", "Number Bases"] },
      { name: "Algebra", subStrands: ["Algebraic Expressions", "Linear Equations", "Inequalities", "Simultaneous Equations"] },
      { name: "Geometry", subStrands: ["Angles and Lines", "Triangles", "Quadrilaterals", "Circles", "Constructions"] },
      { name: "Measurement", subStrands: ["Area", "Volume", "Surface Area", "Speed and Distance"] },
      { name: "Statistics and Probability", subStrands: ["Data Collection", "Measures of Central Tendency", "Probability"] },
    ],
  },
  {
    name: "Integrated Science", grade: "7",
    strands: [
      { name: "Biology", subStrands: ["Cell Biology", "Nutrition", "Transport in Living Things", "Reproduction"] },
      { name: "Chemistry", subStrands: ["Matter and Its Properties", "Mixtures and Separation", "Acids, Bases and Salts"] },
      { name: "Physics", subStrands: ["Forces and Motion", "Energy", "Waves", "Electricity"] },
    ],
  },
  {
    name: "Social Studies", grade: "7",
    strands: [
      { name: "Geography", subStrands: ["Physical Geography", "Human Geography", "Map Work", "Environmental Issues"] },
      { name: "History", subStrands: ["African Civilizations", "Colonial History", "Independence Movements"] },
      { name: "Civics", subStrands: ["Government and Democracy", "Human Rights", "Citizenship"] },
    ],
  },
  {
    name: "Religious Education", grade: "7",
    strands: [
      { name: "Christian Religious Education", subStrands: ["Biblical Teachings", "Christian Ethics", "Church and Society"] },
      { name: "Islamic Religious Education", subStrands: ["Quran and Hadith", "Islamic Jurisprudence", "Islamic History"] },
      { name: "Hindu Religious Education", subStrands: ["Hindu Texts", "Ethics and Values", "Hindu Society"] },
    ],
  },
  {
    name: "Pre-Technical and Pre-Career Education", grade: "7",
    strands: [
      { name: "Technology", subStrands: ["Technical Drawing", "Workshop Safety", "Basic Electronics", "Computer Studies"] },
      { name: "Career Education", subStrands: ["Career Exploration", "Entrepreneurship", "Life Skills"] },
    ],
  },
  {
    name: "Agriculture and Nutrition", grade: "7",
    strands: [
      { name: "Agriculture", subStrands: ["Crop Science", "Animal Science", "Agricultural Economics", "Sustainable Farming"] },
      { name: "Nutrition and Food Technology", subStrands: ["Food Science", "Nutritional Requirements", "Food Processing"] },
    ],
  },
  {
    name: "Creative Arts and Sports", grade: "7",
    strands: [
      { name: "Visual and Performing Arts", subStrands: ["Fine Art", "Music Theory", "Drama", "Film and Media"] },
      { name: "Sports and Physical Education", subStrands: ["Athletics", "Team Sports", "Individual Sports", "Health and Fitness"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // JUNIOR SECONDARY — Grade 8
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "English", grade: "8",
    strands: [
      { name: "Listening and Speaking", subStrands: ["Critical Listening", "Persuasive Speaking", "Interviews", "Seminars"] },
      { name: "Reading", subStrands: ["Advanced Comprehension", "Poetry Analysis", "Prose Analysis", "Drama Analysis"] },
      { name: "Writing", subStrands: ["Formal Writing", "Creative Writing", "Academic Writing", "Digital Writing"] },
      { name: "Language Use", subStrands: ["Advanced Grammar", "Register and Style", "Language and Society"] },
    ],
  },
  {
    name: "Kiswahili", grade: "8",
    strands: [
      { name: "Kusikiliza na Kuzungumza", subStrands: ["Usikilizaji wa Kina", "Usemi wa Kushawishi", "Mahojiano"] },
      { name: "Kusoma", subStrands: ["Ushairi", "Hadithi Fupi", "Tamthilia", "Riwaya"] },
      { name: "Kuandika", subStrands: ["Uandishi Rasmi", "Uandishi wa Ubunifu", "Uandishi wa Kitaaluma"] },
      { name: "Sarufi na Matumizi ya Lugha", subStrands: ["Sarufi ya Juu", "Rejista", "Lugha na Jamii"] },
    ],
  },
  {
    name: "Mathematics", grade: "8",
    strands: [
      { name: "Numbers and Algebra", subStrands: ["Quadratic Expressions", "Quadratic Equations", "Indices and Logarithms"] },
      { name: "Geometry and Measurement", subStrands: ["Pythagoras Theorem", "Trigonometry Basics", "Vectors", "Transformations"] },
      { name: "Statistics and Probability", subStrands: ["Frequency Distribution", "Cumulative Frequency", "Probability Trees"] },
      { name: "Commercial Arithmetic", subStrands: ["Profit and Loss", "Simple Interest", "Compound Interest", "Hire Purchase"] },
    ],
  },
  {
    name: "Integrated Science", grade: "8",
    strands: [
      { name: "Biology", subStrands: ["Genetics Basics", "Ecology", "Disease and Immunity", "Biotechnology Introduction"] },
      { name: "Chemistry", subStrands: ["Atomic Structure", "Chemical Bonding", "Reactions", "Organic Chemistry Basics"] },
      { name: "Physics", subStrands: ["Mechanics", "Thermal Physics", "Optics", "Electromagnetism"] },
    ],
  },
  {
    name: "Social Studies", grade: "8",
    strands: [
      { name: "Geography", subStrands: ["Population", "Urbanization", "Economic Geography", "Regional Geography"] },
      { name: "History", subStrands: ["World Wars", "Cold War", "African Unity", "Kenya Post-Independence"] },
      { name: "Civics", subStrands: ["Constitution of Kenya", "Devolution", "International Relations"] },
    ],
  },
  {
    name: "Religious Education", grade: "8",
    strands: [
      { name: "Christian Religious Education", subStrands: ["Christian Social Teaching", "Bioethics", "Ecumenism"] },
      { name: "Islamic Religious Education", subStrands: ["Islamic Economics", "Family in Islam", "Contemporary Issues"] },
      { name: "Hindu Religious Education", subStrands: ["Hindu Philosophy", "Social Responsibility", "Modern Hinduism"] },
    ],
  },
  {
    name: "Pre-Technical and Pre-Career Education", grade: "8",
    strands: [
      { name: "Technology", subStrands: ["Advanced Technical Drawing", "Electronics", "Programming Basics", "Robotics Introduction"] },
      { name: "Career Education", subStrands: ["Career Planning", "Business Skills", "Financial Literacy"] },
    ],
  },
  {
    name: "Agriculture and Nutrition", grade: "8",
    strands: [
      { name: "Agriculture", subStrands: ["Soil Science", "Irrigation and Water Management", "Agribusiness Planning"] },
      { name: "Nutrition and Food Technology", subStrands: ["Food Biochemistry", "Diet and Disease", "Food Industry"] },
    ],
  },
  {
    name: "Creative Arts and Sports", grade: "8",
    strands: [
      { name: "Visual and Performing Arts", subStrands: ["Advanced Fine Art", "Music Composition", "Theatre Production", "Digital Media"] },
      { name: "Sports and Physical Education", subStrands: ["Sports Science", "Coaching Basics", "Sports Management", "Wellness"] },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // JUNIOR SECONDARY — Grade 9
  // ══════════════════════════════════════════════════════════════════════════

  {
    name: "English", grade: "9",
    strands: [
      { name: "Listening and Speaking", subStrands: ["Academic Discourse", "Formal Debates", "Presentations", "Media Literacy"] },
      { name: "Reading", subStrands: ["Extended Reading", "Critical Analysis", "Research Reading", "Digital Literacy"] },
      { name: "Writing", subStrands: ["Research Papers", "Argumentative Essays", "Portfolio Writing", "Digital Communication"] },
      { name: "Language Use", subStrands: ["Advanced Stylistics", "Language Variation", "Language and Power"] },
    ],
  },
  {
    name: "Kiswahili", grade: "9",
    strands: [
      { name: "Kusikiliza na Kuzungumza", subStrands: ["Mazungumzo ya Kitaaluma", "Midahalo", "Uwasilishaji"] },
      { name: "Kusoma", subStrands: ["Usomaji wa Kina", "Uchambuzi wa Fasihi", "Utafiti"] },
      { name: "Kuandika", subStrands: ["Makala ya Utafiti", "Insha za Hoja", "Uandishi wa Kidijitali"] },
      { name: "Sarufi na Matumizi ya Lugha", subStrands: ["Mitindo ya Lugha", "Lugha na Nguvu", "Lugha ya Kidijitali"] },
    ],
  },
  {
    name: "Mathematics", grade: "9",
    strands: [
      { name: "Numbers and Algebra", subStrands: ["Matrices", "Sequences and Series", "Binomial Theorem Basics"] },
      { name: "Geometry and Trigonometry", subStrands: ["Advanced Trigonometry", "3D Geometry", "Coordinate Geometry"] },
      { name: "Calculus Introduction", subStrands: ["Limits", "Differentiation Basics", "Integration Basics"] },
      { name: "Statistics and Probability", subStrands: ["Normal Distribution", "Hypothesis Testing Basics", "Correlation"] },
    ],
  },
  {
    name: "Integrated Science", grade: "9",
    strands: [
      { name: "Biology", subStrands: ["Evolution", "Genetics and Heredity", "Environmental Biology", "Human Health"] },
      { name: "Chemistry", subStrands: ["Electrochemistry", "Industrial Chemistry", "Environmental Chemistry"] },
      { name: "Physics", subStrands: ["Nuclear Physics Basics", "Electronics", "Astronomy Basics"] },
    ],
  },
  {
    name: "Social Studies", grade: "9",
    strands: [
      { name: "Geography", subStrands: ["Global Issues", "Climate Change", "Sustainable Development Goals"] },
      { name: "History", subStrands: ["Contemporary World History", "Globalization", "Technology and Society"] },
      { name: "Civics", subStrands: ["Global Citizenship", "International Law", "Human Rights in Practice"] },
    ],
  },
  {
    name: "Religious Education", grade: "9",
    strands: [
      { name: "Christian Religious Education", subStrands: ["Faith and Science", "Social Justice", "Christian Leadership"] },
      { name: "Islamic Religious Education", subStrands: ["Islamic Civilization", "Peace and Conflict", "Muslim Leadership"] },
      { name: "Hindu Religious Education", subStrands: ["Hindu Contributions to Civilization", "Interfaith Dialogue", "Hindu Leadership"] },
    ],
  },
  {
    name: "Pre-Technical and Pre-Career Education", grade: "9",
    strands: [
      { name: "Technology", subStrands: ["Advanced Programming", "Artificial Intelligence Basics", "Engineering Design", "Cybersecurity Basics"] },
      { name: "Career Education", subStrands: ["Career Pathways", "Entrepreneurship Project", "Work Readiness"] },
    ],
  },
  {
    name: "Agriculture and Nutrition", grade: "9",
    strands: [
      { name: "Agriculture", subStrands: ["Agricultural Research", "Climate-Smart Agriculture", "Agricultural Policy"] },
      { name: "Nutrition and Food Technology", subStrands: ["Food Security", "Nutrition Policy", "Food Innovation"] },
    ],
  },
  {
    name: "Creative Arts and Sports", grade: "9",
    strands: [
      { name: "Visual and Performing Arts", subStrands: ["Portfolio Development", "Professional Music", "Film Production", "Arts Entrepreneurship"] },
      { name: "Sports and Physical Education", subStrands: ["Elite Sports Training", "Sports Psychology", "Sports Business", "Community Sports"] },
    ],
  },
];
