import {Request, ResponseToolkit} from '@hapi/hapi';
import * as shiftUsecase from '../../../usecases/shiftUsecase';
import {errorHandler} from '../../../shared/functions/error';
import {
  ICreateShift,
  IFindShift,
  IPublishShift,
  ISuccessResponse,
  IUpdateShift,
} from '../../../shared/interfaces';
import moduleLogger from '../../../shared/functions/logger';
import {HttpError} from '../../../shared/classes/HttpError';
import {CONSTANT} from '../../../helpers/Constant';
import {startOfWeek, endOfWeek, add, isSameWeek} from 'date-fns';
import {Between} from 'typeorm';
import Shift from '../../../database/default/entity/shift';
import {timeChecker} from '../../../helpers/TimeChecker';

const logger = moduleLogger('shiftController');

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info('Find shifts');
  try {
    const filter = req.query as IFindShift;
    const data = await shiftUsecase.find(filter);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: 'Get shift successful',
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const findById = async (req: Request, h: ResponseToolkit) => {
  logger.info('Find shift by id');
  try {
    const id = req.params.id;
    const data = await shiftUsecase.findById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: 'Get shift successful',
      results: data ?? [],
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const create = async (req: Request, h: ResponseToolkit) => {
  logger.info('Create shift');
  try {
    const body = req.payload as ICreateShift;

    // check if date already exist
    const shiftData = await shiftUsecase.findAllByQuery({
      date: body.date,
    });
    if (shiftData.length) {
      const isError = timeChecker(shiftData, body);
      if (isError === true) {
        throw new HttpError(400, 'Shift already exist');
      }
    }

    // Check if date between already published

    // const startDate = add(startOfWeek(new Date(body.date), {weekStartsOn: 1}), {hours: 7});
    // const endDate = add(endOfWeek(new Date(body.date), {weekStartsOn: 1}), {hours: 7});

    const startDate = startOfWeek(new Date(body.date), {weekStartsOn: 1});
    const endDate = endOfWeek(new Date(body.date), {weekStartsOn: 1});

    const shiftSameWeekData = await shiftUsecase.find({
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      status: 'published',
    });
    if (shiftSameWeekData.length) {
      throw new HttpError(400, 'Shift already published');
    }

    const data = await shiftUsecase.create(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: 'Create shift successful',
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const updateById = async (req: Request, h: ResponseToolkit) => {
  logger.info('Update shift by id');
  try {
    const id = req.params.id;
    const body = req.payload as IUpdateShift;

    // check if status published
    const shiftData = await shiftUsecase.findById(id);
    if (!shiftData) {
      throw new HttpError(400, 'Shift not found');
    }
    if (shiftData.status === CONSTANT.PUBLISHED) {
      throw new HttpError(400, 'Shift cannot be changed');
    }

    // const startDate = add(startOfWeek(new Date(body.date), {weekStartsOn: 1}), {hours: 7});
    // const endDate = add(endOfWeek(new Date(body.date), {weekStartsOn: 1}), {hours: 7});

    const startDate = startOfWeek(new Date(body.date), {weekStartsOn: 1});
    const endDate = endOfWeek(new Date(body.date), {weekStartsOn: 1});
    const shiftSameWeekData = await shiftUsecase.find({
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      status: 'published',
    });
    if (shiftSameWeekData.length) {
      throw new HttpError(400, 'Shift cannot be changed to that date');
    }

    const shiftDataTemp = await shiftUsecase.findAllByQuery({
      date: body.date,
    });
    if (shiftDataTemp.length) {
      const isError = timeChecker(shiftDataTemp, body);
      if (isError === true) {
        throw new HttpError(400, 'Shift already exist');
      }
    }

    const data = await shiftUsecase.updateById(id, body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: 'Update shift successful',
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const deleteById = async (req: Request, h: ResponseToolkit) => {
  logger.info('Delete shift by id');
  try {
    const id = req.params.id;

    // check if status published
    const shiftData = await shiftUsecase.findById(id);
    if (!shiftData) {
      throw new HttpError(400, 'Shift not found');
    }
    if (shiftData.status === CONSTANT.PUBLISHED) {
      throw new HttpError(400, 'Shift cannot be deleted');
    }

    const data = await shiftUsecase.deleteById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: 'Delete shift successful',
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};

export const publish = async (req: Request, h: ResponseToolkit) => {
  logger.info('Update many by id');

  try {
    const body = req.payload as IPublishShift;

    // check if published not in same week
    const shiftData = await shiftUsecase.findById(body.shiftArrId[0]);
    if (!isSameWeek(new Date(shiftData.date), new Date(), {weekStartsOn: 1})) {
      throw new HttpError(400, 'Publish failed, different Week');
    }

    const data = await shiftUsecase.publishShift(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: 'Publish shift successful',
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message);
    return errorHandler(h, error);
  }
};
