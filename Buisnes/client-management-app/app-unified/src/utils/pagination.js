export const paginate = (items, page, itemsPerPage) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return {
    paginatedItems: items.slice(startIndex, endIndex),
    totalPages: Math.ceil(items.length / itemsPerPage),
  };
};
