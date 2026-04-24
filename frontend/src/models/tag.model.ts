import { Model, Property, createModel, DefaultValue } from 'transform-model';

class TagModel extends Model {
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

export default (res: any) => createModel(TagModel, res);
