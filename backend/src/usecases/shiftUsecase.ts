import * as shiftRepository from '../database/default/repository/shiftRepository';
import {Between, FindConditions, FindManyOptions, FindOneOptions} from 'typeorm';
import Shift from '../database/default/entity/shift';
import {ICreateShift, IFindShift, IPublishShift, IUpdateShift} from '../shared/interfaces';
import {CONSTANT} from '../helpers/Constant';

export const find = async (query: IFindShift, opts?: FindManyOptions<Shift>): Promise<Shift[]> => {
  const options = {...opts};
  const where: any = {};
  if (query.startDate && query.endDate) {
    where.date = Between(new Date(query.startDate), new Date(query.endDate));
  }
  if (query.status) {
    where.status = query.status;
  }
  options.where = where;
  return shiftRepository.find(options);
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
  return shiftRepository.publishShift(payload.shiftArrId, {
    status: CONSTANT.PUBLISHED,
    publishedDate: publishedDate,
  });
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};
