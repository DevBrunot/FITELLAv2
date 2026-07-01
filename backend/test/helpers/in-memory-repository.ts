import { randomUUID } from 'crypto';

type Where<T> = Partial<T> | Partial<T>[];

export function createInMemoryRepository<T extends { id?: string }>() {
  const items: T[] = [];

  const matchWhere = (entity: T, where: Record<string, unknown>) =>
    Object.entries(where).every(([key, value]) => {
      if (value && typeof value === 'object' && '_type' in value) {
        const operator = value as { _type: string; _value: unknown };
        if (operator._type === 'in') {
          return (operator._value as unknown[]).includes((entity as Record<string, unknown>)[key]);
        }
      }
      return (entity as Record<string, unknown>)[key] === value;
    });

  const findMatch = (where: Where<T>): T | null => {
    const conditions = Array.isArray(where) ? where : [where];
    return items.find((item) => conditions.some((cond) => matchWhere(item, cond as Record<string, unknown>))) ?? null;
  };

  return {
    items,
    create: (dto: Partial<T>) => ({ ...dto } as T),
    save: async (entity: T): Promise<T> => {
      const record = { ...entity };
      if (!record.id) record.id = randomUUID();
      const index = items.findIndex((item) => item.id === record.id);
      if (index >= 0) items[index] = record;
      else items.push(record);
      return record;
    },
    findOneBy: async (where: Partial<T>) => findMatch(where),
    findOne: async (options: { where: Where<T>; relations?: string[]; order?: Record<string, string> }) => {
      const conditions = Array.isArray(options.where) ? options.where : [options.where];
      let result = items.filter((item) => conditions.some((cond) => matchWhere(item, cond as Record<string, unknown>)));

      if (options.order?.createdAt === 'DESC') {
        result = [...result].reverse();
      }

      return result[0] ?? null;
    },
    find: async (options?: { where?: Record<string, unknown> }) => {
      if (!options?.where) return [...items];
      return items.filter((item) => matchWhere(item, options.where!));
    },
    findAndCount: async (options: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      order?: Record<string, string>;
    }) => {
      let data = options.where
        ? items.filter((item) => matchWhere(item, options.where as Record<string, unknown>))
        : [...items];

      if (options.order?.createdAt === 'DESC') {
        data = [...data].reverse();
      }

      const total = data.length;
      const skip = options.skip ?? 0;
      const take = options.take ?? data.length;
      data = data.slice(skip, skip + take);

      return [data, total] as [T[], number];
    },
    remove: async (entity: T) => {
      const index = items.findIndex((item) => item.id === entity.id);
      if (index >= 0) items.splice(index, 1);
      return entity;
    },
  };
}
