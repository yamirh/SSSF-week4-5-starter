import catModel from '../models/catModel';
import {Cat, LocationInput} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import {isLogged} from '../../functions/authorize';

export default {
  Query: {
    cats: async () => {
      return catModel.find();
    },
    catById: async (_parent: undefined, args: {id: string}) => {
      return catModel.findById(args.id);
    },
    catsByArea: async (_parent: undefined, args: LocationInput) => {
      const rightCorner = [args.topRight.lng, args.topRight.lat];
      const leftCorner = [args.bottomLeft.lng, args.bottomLeft.lat];

      return catModel.find({
        location: {
          $geoWithin: {
            $box: [leftCorner, rightCorner],
          },
        },
      });
    },
    catsByOwner: async (_parent: undefined, args: {ownerId: string}) => {
      return catModel.find({owner: args.ownerId});
    },
  },
  Mutation: {
    createCat: async (
      _parent: undefined,
      args: {input: Omit<Cat, 'id' | 'owner'>},
      context: MyContext,
    ) => {
      isLogged(context);
      const input = {...args.input, owner: context.userdata?.user?.id};
      const cat = await catModel.create(input);
      return cat;
    },
    updateCat: async (
      _parent: undefined,
      args: {id: string; input: Omit<Cat, 'id' | 'owner' | 'filename'>},
      context: MyContext,
    ) => {
      isLogged(context);
      if (context.userdata?.user?.role === 'admin') {
        return catModel.findByIdAndUpdate(args.id, args.input, {
          new: true,
        });
      }

      const filter = {_id: args.id, owner: context.userdata?.user?.id};
      return catModel.findOneAndUpdate(filter, args.input, {new: true});
    },
    deleteCat: async (
      _parent: undefined,
      args: {id: string},
      context: MyContext,
    ) => {
      isLogged(context);
      if (context.userdata?.user?.role === 'admin') {
        return catModel.findOneAndDelete({_id: args.id});
      }

      const filter = {_id: args.id, owner: context.userdata?.user?.id};
      return catModel.findOneAndDelete(filter);
    },
  },
};
