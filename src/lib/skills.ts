/**
 * Skill normalization.
 *
 * An alias table of roughly 100 skills maps common variants to one
 * canonical name ("js", "java script" -> "javascript"; "reactjs",
 * "react.js" -> "react"; "node", "nodejs" -> "node.js"; ...).
 *
 * normalize(skillsText) turns comma-separated free text into a deduped
 * list of canonical skills. Unknown skills pass through as cleaned
 * lowercase text so nothing a student types is ever dropped.
 */

export type SkillEntry = {
  /** Canonical name (lowercase). */
  name: string;
  /** Human-friendly display name. */
  display: string;
  /** Common variants that map to the canonical name. */
  aliases: string[];
};

export const SKILL_TABLE: SkillEntry[] = [
  // Languages
  { name: "javascript", display: "JavaScript", aliases: ["js", "java script", "java-script", "ecmascript"] },
  { name: "typescript", display: "TypeScript", aliases: ["ts", "type script"] },
  { name: "python", display: "Python", aliases: ["py", "python3", "python 3"] },
  { name: "java", display: "Java", aliases: ["core java", "java se"] },
  { name: "c", display: "C", aliases: ["c language", "c programming"] },
  { name: "c++", display: "C++", aliases: ["cpp", "c plus plus"] },
  { name: "c#", display: "C#", aliases: ["csharp", "c sharp", "c-sharp"] },
  { name: "go", display: "Go", aliases: ["golang"] },
  { name: "rust", display: "Rust", aliases: ["rust lang", "rustlang"] },
  { name: "kotlin", display: "Kotlin", aliases: ["kt"] },
  { name: "swift", display: "Swift", aliases: ["swift 5", "swift5"] },
  { name: "ruby", display: "Ruby", aliases: ["ruby lang"] },
  { name: "php", display: "PHP", aliases: ["php7", "php8"] },
  { name: "r", display: "R", aliases: ["r language", "r programming", "rlang"] },
  { name: "matlab", display: "MATLAB", aliases: ["mat lab"] },
  { name: "scala", display: "Scala", aliases: ["scala lang"] },
  { name: "perl", display: "Perl", aliases: ["perl5", "perl 5"] },
  { name: "dart", display: "Dart", aliases: ["dart lang"] },
  { name: "sql", display: "SQL", aliases: ["structured query language"] },
  { name: "html", display: "HTML", aliases: ["html5", "hypertext markup language"] },
  { name: "css", display: "CSS", aliases: ["css3", "cascading style sheets"] },

  // Frontend
  { name: "react", display: "React", aliases: ["reactjs", "react.js", "react js"] },
  { name: "react native", display: "React Native", aliases: ["reactnative", "react-native"] },
  { name: "angular", display: "Angular", aliases: ["angularjs", "angular.js"] },
  { name: "vue", display: "Vue", aliases: ["vuejs", "vue.js", "vue js"] },
  { name: "next.js", display: "Next.js", aliases: ["nextjs", "next js"] },
  { name: "svelte", display: "Svelte", aliases: ["sveltejs", "svelte.js"] },
  { name: "redux", display: "Redux", aliases: ["redux.js", "reduxjs", "react redux"] },
  { name: "tailwind", display: "Tailwind", aliases: ["tailwindcss", "tailwind css"] },
  { name: "sass", display: "Sass", aliases: ["scss"] },
  { name: "bootstrap", display: "Bootstrap", aliases: ["twitter bootstrap", "bootstrap 5"] },
  { name: "jquery", display: "jQuery", aliases: ["jquery.js"] },
  { name: "webpack", display: "Webpack", aliases: ["web pack", "webpack 5"] },
  { name: "vite", display: "Vite", aliases: ["vitejs", "vite.js"] },
  { name: "babel", display: "Babel", aliases: ["babeljs", "babel.js"] },
  { name: "eslint", display: "ESLint", aliases: ["es lint"] },

  // Backend and APIs
  { name: "node.js", display: "Node.js", aliases: ["node", "nodejs", "node js"] },
  { name: "express", display: "Express", aliases: ["expressjs", "express.js", "express js"] },
  { name: "django", display: "Django", aliases: ["python django"] },
  { name: "flask", display: "Flask", aliases: ["python flask"] },
  { name: "spring boot", display: "Spring Boot", aliases: ["spring", "springboot", "spring-boot"] },
  { name: "rails", display: "Rails", aliases: ["ruby on rails", "ror", "rubyonrails"] },
  { name: "laravel", display: "Laravel", aliases: ["laravel php"] },
  { name: "fastapi", display: "FastAPI", aliases: ["fast api", "fast-api"] },
  { name: "graphql", display: "GraphQL", aliases: ["graph ql", "gql"] },
  { name: "rest", display: "REST", aliases: ["rest api", "restful", "restful api", "rest apis"] },
  { name: "grpc", display: "gRPC", aliases: ["google rpc"] },
  { name: "microservices", display: "Microservices", aliases: ["micro services", "micro-services", "microservice"] },
  { name: "websockets", display: "WebSockets", aliases: ["websocket", "web sockets", "web socket"] },

  // Data and ML
  { name: "machine learning", display: "Machine learning", aliases: ["ml"] },
  { name: "deep learning", display: "Deep learning", aliases: ["dl"] },
  { name: "data analysis", display: "Data analysis", aliases: ["data analytics", "data-analysis"] },
  { name: "data science", display: "Data science", aliases: ["datascience", "data-science"] },
  { name: "nlp", display: "NLP", aliases: ["natural language processing"] },
  { name: "computer vision", display: "Computer vision", aliases: ["cv"] },
  { name: "tensorflow", display: "TensorFlow", aliases: ["tf", "tensor flow"] },
  { name: "pytorch", display: "PyTorch", aliases: ["py torch", "torch"] },
  { name: "scikit-learn", display: "scikit-learn", aliases: ["sklearn", "scikit learn", "scikitlearn"] },
  { name: "pandas", display: "pandas", aliases: ["python pandas"] },
  { name: "numpy", display: "NumPy", aliases: ["num py"] },
  { name: "keras", display: "Keras", aliases: ["tf keras"] },
  { name: "opencv", display: "OpenCV", aliases: ["open cv", "cv2"] },
  { name: "excel", display: "Excel", aliases: ["ms excel", "microsoft excel"] },
  { name: "tableau", display: "Tableau", aliases: ["tableu"] },
  { name: "power bi", display: "Power BI", aliases: ["powerbi", "ms power bi"] },
  { name: "statistics", display: "Statistics", aliases: ["stats", "statistical analysis"] },
  { name: "spark", display: "Spark", aliases: ["apache spark", "pyspark"] },

  // Databases
  { name: "mysql", display: "MySQL", aliases: ["my sql", "my-sql"] },
  { name: "postgresql", display: "PostgreSQL", aliases: ["postgres", "psql", "postgre sql"] },
  { name: "mongodb", display: "MongoDB", aliases: ["mongo", "mongo db"] },
  { name: "redis", display: "Redis", aliases: ["redis cache"] },
  { name: "sqlite", display: "SQLite", aliases: ["sqlite3", "sql lite"] },
  { name: "firebase", display: "Firebase", aliases: ["google firebase", "firebase db"] },
  { name: "dynamodb", display: "DynamoDB", aliases: ["dynamo db", "aws dynamodb"] },
  { name: "elasticsearch", display: "Elasticsearch", aliases: ["elastic search", "elastic"] },
  { name: "cassandra", display: "Cassandra", aliases: ["apache cassandra"] },

  // Cloud and DevOps
  { name: "aws", display: "AWS", aliases: ["amazon web services", "amazon aws"] },
  { name: "azure", display: "Azure", aliases: ["microsoft azure", "ms azure"] },
  { name: "google cloud", display: "Google Cloud", aliases: ["gcp", "google cloud platform"] },
  { name: "docker", display: "Docker", aliases: ["docker container", "docker containers"] },
  { name: "kubernetes", display: "Kubernetes", aliases: ["k8s", "kube"] },
  { name: "terraform", display: "Terraform", aliases: ["hashicorp terraform"] },
  { name: "ci/cd", display: "CI/CD", aliases: ["cicd", "ci cd", "continuous integration", "continuous deployment"] },
  { name: "jenkins", display: "Jenkins", aliases: ["jenkins ci", "jenkins pipeline"] },
  { name: "github actions", display: "GitHub Actions", aliases: ["gh actions"] },
  { name: "git", display: "Git", aliases: ["git scm"] },
  { name: "github", display: "GitHub", aliases: ["git hub", "gh"] },
  { name: "gitlab", display: "GitLab", aliases: ["git lab"] },
  { name: "linux", display: "Linux", aliases: ["gnu/linux", "ubuntu", "debian"] },
  { name: "bash", display: "Bash", aliases: ["bash scripting", "shell scripting", "shell script"] },
  { name: "powershell", display: "PowerShell", aliases: ["power shell", "pwsh"] },

  // Practices and tools
  { name: "agile", display: "Agile", aliases: ["agile methodology", "agile methodologies"] },
  { name: "scrum", display: "Scrum", aliases: ["scrum methodology"] },
  { name: "testing", display: "Testing", aliases: ["unit testing", "software testing"] },
  { name: "jest", display: "Jest", aliases: ["jest testing"] },
  { name: "selenium", display: "Selenium", aliases: ["selenium webdriver"] },
  { name: "pytest", display: "pytest", aliases: ["py test", "py.test"] },
  { name: "figma", display: "Figma", aliases: ["figma design"] },
  { name: "networking", display: "Networking", aliases: ["computer networks", "computer networking", "tcp/ip"] },
  { name: "algorithms", display: "Algorithms", aliases: ["algorithm"] },
  { name: "data structures", display: "Data structures", aliases: ["data structure", "dsa"] },
  { name: "oop", display: "OOP", aliases: ["object oriented programming", "object-oriented programming"] },
  { name: "api", display: "API", aliases: ["apis", "web api", "web apis"] },
  { name: "ui design", display: "UI design", aliases: ["ui", "user interface design"] },
  { name: "ux design", display: "UX design", aliases: ["ux", "user experience design"] },
  { name: "cybersecurity", display: "Cybersecurity", aliases: ["cyber security", "infosec", "information security"] },
];

function cleanSkill(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** alias (cleaned) -> canonical name */
const aliasLookup = new Map<string, string>();
/** canonical name -> display name */
const displayLookup = new Map<string, string>();

for (const entry of SKILL_TABLE) {
  aliasLookup.set(cleanSkill(entry.name), entry.name);
  displayLookup.set(entry.name, entry.display);
  for (const alias of entry.aliases) {
    aliasLookup.set(cleanSkill(alias), entry.name);
  }
}

/**
 * Converts comma-separated skills text (or a list of skills) into a
 * deduped list of canonical skill names, preserving first-seen order.
 */
export function normalize(skillsText: string | string[]): string[] {
  const text = Array.isArray(skillsText) ? skillsText.join(",") : skillsText;
  const parts = text.split(/[,;\n]+/);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    const key = cleanSkill(part);
    if (!key) continue;
    const canonical = aliasLookup.get(key) ?? key;
    if (!seen.has(canonical)) {
      seen.add(canonical);
      result.push(canonical);
    }
  }

  return result;
}

/** Display name for a canonical skill; unknown skills pass through. */
export function displayName(canonical: string): string {
  return displayLookup.get(canonical) ?? canonical;
}
