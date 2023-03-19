import {Request, ResponseToolkit} from '@hapi/hapi';
import * as shiftUsecase from '../../../usecases/shiftUsecase';
import {errorHandler} from '../../../shared/functions/error';
import {
  ICreateShift,
  IPublishShift,
  ISuccessResponse,
  IUpdateShift,
} from '../../../shared/interfaces';
import moduleLogger from '../../../shared/functions/logger';
import {HttpError} from '../../../shared/classes/HttpError';
import {CONSTANT} from '../../../helpers/Constant';

const logger = moduleLogger('shiftController');

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info('Find shifts');
  try {
    const filter = req.query;
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

    // FindById, and check if date already exist
    const shiftData = await shiftUsecase.findAllByQuery({
      date: body.date,
    });
    if (shiftData.length) {
      throw new HttpError(400, 'Shift already exist');
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

    // findById check if status published
    const shiftData = await shiftUsecase.findById(id);
    if (!shiftData) {
      throw new HttpError(400, 'Shift not found');
    }
    if (shiftData.status === CONSTANT.PUBLISHED) {
      throw new HttpError(400, 'Shift cannot be changed');
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
    // findById check if status published
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
  logger.info('Update shift by id');
  try {
    const body = req.payload as IPublishShift;

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
