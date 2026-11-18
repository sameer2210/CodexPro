const PUBLIC_PROBLEM_FIELDS = [
  "_id",
  "title",
  "description",
  "difficulty",
  "tags",
  "visibleTestCases",
  "startCode",
  "secureUrl",
  "thumbnailUrl",
  "duration",
  "createdAt",
  "updatedAt",
];

export const publicProblemSelect = PUBLIC_PROBLEM_FIELDS.join(" ");

export const toPublicProblem = (problem) => {
  if (!problem) return problem;
  const source =
    typeof problem.toObject === "function" ? problem.toObject() : problem;
  return Object.fromEntries(
    PUBLIC_PROBLEM_FIELDS.filter((field) => source[field] !== undefined).map(
      (field) => [field, source[field]],
    ),
  );
};

export const toPublicContest = (contest) => {
  if (!contest) return contest;
  const source =
    typeof contest.toObject === "function" ? contest.toObject() : contest;
  return {
    ...source,
    problems: Array.isArray(source.problems)
      ? source.problems.map(toPublicProblem)
      : source.problems,
  };
};
