export const DIRECTORY_USER_COLORS = [
  '#1B5E20',
  '#BA68C8',
  '#E57373',
  '#FFF176',
]

export const getNextColor = (
  idx: number,
  schema: string[] = DIRECTORY_USER_COLORS,
): string => {
  return schema[idx % schema.length]
}
