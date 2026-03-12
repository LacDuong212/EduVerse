import { toCourseCartItemDto } from "#modules/course/course.mapper.js";

export const toCartItemsDto = (cart) => {
  if (!cart) return null;

  return (cart.courses || []).map(item => (
    toCourseCartItemDto(item?.course, item?.addedAt)
  ));
};