import * as shiftRepository from '../database/default/repository/shiftRepository';
import {FindConditions, FindManyOptions, FindOneOptions} from 'typeorm';
import Shift from '../database/default/entity/shift';
import {ICreateShift, IPublishShift, IUpdateShift} from '../shared/interfaces';
import {CONSTANT} from '../helpers/Constant';

export const find = async (opts: FindManyOptions<Shift>): Promise<Shift[]> => {
  return shiftRepository.find(opts);
};

export const findById = async (id: string, opts?: FindOneOptions<Shift>): Promise<Shift> => {
  return shiftRepository.findById(id, opts) ?? null;
};

export const findAllByQuery = async (opts: FindConditions<Shift>): Promise<Shift[]> => {
  return shiftRepository.findAllByQuery(opts);
};

export const create = async (payload: ICreateShift): Promise<Shift> => {
  const shift = new Shift();
  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;
  shift.status = CONSTANT.CREATED;

  return shiftRepository.create(shift);
};

export const updateById = async (id: string, payload: IUpdateShift): Promise<Shift> => {
  return shiftRepository.updateById(id, {
    ...payload,
  });
};

export const publishShift = async (payload: IPublishShift) => {
  const publishedDate = new Date();
  return shiftRepository.updateManyById(payload.shiftArrId, {
    status: CONSTANT.PUBLISHED,
    publishedDate: publishedDate,
  });
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};
