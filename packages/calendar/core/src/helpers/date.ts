export const convertToDate = (
  val: string | number | Date | number[] = new Date(),
): Date => {
  if (typeof val === "string" || typeof val === "number") {
    return new Date(val);
  }
  if (Array.isArray(val)) {
    return new Date();
  }
  return val;
};
