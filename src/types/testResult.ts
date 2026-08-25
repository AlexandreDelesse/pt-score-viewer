export type TestResult = {
  test: string;
  score: string;
  stanine: number;
  at: string;
};

export type TestCategory = "psy0" | "psy1";
export type TestCategoryMap = Record<string, TestCategory>;
