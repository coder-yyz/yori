import { createModel, DefaultValue, Model, Property } from 'transform-model';

class CategoryModel extends Model {
  @Property('id')
  @DefaultValue('--')
  id: string;

  @Property('name')
  @DefaultValue('--')
  name: string;

  @Property('blogCount')
  @DefaultValue(0)
  blogCount: number;
}

export default (res: any) => createModel(CategoryModel, res);
