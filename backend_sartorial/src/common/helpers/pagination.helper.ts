import { SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

export async function paginateQuery<T>(
  queryBuilder: SelectQueryBuilder<T>,
  paginationDto: PaginationDto,
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(paginationDto.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(paginationDto.limit) || 10));
  const skip = (page - 1) * limit;

  queryBuilder.skip(skip).take(limit);

  const [data, total] = await queryBuilder.getManyAndCount();
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
