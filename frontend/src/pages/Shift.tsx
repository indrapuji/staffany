import React, {FunctionComponent, useEffect, useState} from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {makeStyles} from '@material-ui/core/styles';
import {Button, Typography} from '@material-ui/core';
import {getErrorMessage} from '../helper/error/index';
import {deleteShiftById, getShifts, publishShiftById} from '../helper/api/shift';
import DataTable from 'react-data-table-component';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import {useHistory} from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '@material-ui/lab/Alert';
import {Link as RouterLink} from 'react-router-dom';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

import {STAFFANY_TURQOISE} from '../commons/colors';
import {isSameWeek, format, startOfWeek, endOfWeek, sub, add} from 'date-fns';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  clr: {
    color: STAFFANY_TURQOISE,
    fontSize: 17,
  },
  typo: {
    color: STAFFANY_TURQOISE,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: 'white',
    color: theme.color.turquoise,
  },
  addShiftBtn: {
    color: STAFFANY_TURQOISE,
    borderColor: STAFFANY_TURQOISE,
    marginLeft: 20,
  },
  publishBtn: {
    backgroundColor: STAFFANY_TURQOISE,
    color: 'white',
    marginLeft: 20,
  },
}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
}
const ActionButton: FunctionComponent<ActionButtonProps> = ({id, onDelete}) => {
  return (
    <div>
      <IconButton size='small' aria-label='delete' component={RouterLink} to={`/shift/${id}/edit`}>
        <EditIcon fontSize='small' />
      </IconButton>
      <IconButton size='small' aria-label='delete' onClick={() => onDelete()}>
        <DeleteIcon fontSize='small' />
      </IconButton>
    </div>
  );
};

const Shift = () => {
  const classes = useStyles();
  const history = useHistory();

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [dis, setDis] = useState<boolean>(false);
  const [publish, setpublish] = useState<string | null>(null);
  const [publishedDate, setPublishedDate] = useState<any>();
  const [arrId, setArrId] = useState<any>([]);
  const [newWeek, setNewWeek] = useState<any>();
  const [endWeek, setEndWeek] = useState<any>();

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setErrMsg('');
        const {results} = await getShifts();

        if (results.length > 0) {
          const loopResult = results.map((item: any) => {
            return item.id;
          });
          setArrId(loopResult);
        }
        setRows(results);

        setPublishedDate(results[0].publishedDate);
        setpublish(format(new Date(results[0].publishedDate), 'dd MMM y, p'));
        setDis(isSameWeek(new Date(), new Date(results[0].publishedDate)));

        setNewWeek(startOfWeek(new Date(), {weekStartsOn: 1}));
        setEndWeek(endOfWeek(new Date(), {weekStartsOn: 1}));
      } catch (error) {
        const message = getErrorMessage(error);
        setErrMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
    // eslint-disable-next-line
  }, []);

  const columns = [
    {
      name: 'Name',
      selector: 'name',
      sortable: true,
    },
    {
      name: 'Date',
      selector: 'date',
      sortable: true,
    },
    {
      name: 'Start Time',
      selector: 'startTime',
      sortable: true,
    },
    {
      name: 'End Time',
      selector: 'endTime',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row: any) => <ActionButton id={row.id} onDelete={() => onDeleteClick(row.id)} />,
    },
  ];

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg('');

      if (selectedId === null) {
        throw new Error('ID is null');
      }

      console.log(deleteDataById);

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  const onPublish = async () => {
    try {
      setIsLoading(true);
      setErrMsg('');
      if (arrId.length < 0) {
        throw new Error('ID is null');
      }
      await publishShiftById(arrId);
      const {results} = await getShifts();
      setRows(results);

      setPublishedDate(results[0].publishedDate);
      setpublish(format(new Date(results[0].publishedDate), 'dd MMM y, p'));
      setDis(isSameWeek(new Date(), new Date(results[0].publishedDate)));

      setNewWeek(startOfWeek(new Date(), {weekStartsOn: 1}));
      setEndWeek(endOfWeek(new Date(), {weekStartsOn: 1}));
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const changeWeek = (order: string) => {
    if (order === 'prev') {
      const newMonDate = sub(new Date(newWeek), {weeks: 1});
      setNewWeek(newMonDate);
      const newSunDate = sub(new Date(endWeek), {weeks: 1});
      setEndWeek(newSunDate);
      setDis(isSameWeek(new Date(newSunDate), new Date(publishedDate)));
      console.log(publishedDate);
    } else {
      const newMonDate = add(new Date(newWeek), {weeks: 1});
      setNewWeek(newMonDate);
      const newSunDate = add(new Date(endWeek), {weeks: 1});
      setEndWeek(newSunDate);
      setDis(isSameWeek(new Date(newSunDate), new Date(publishedDate)));
    }
  };

  const changeDate = (datePublish: string) => {
    return datePublish.toString().substring(4, 10);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            <Grid container justifyContent='space-between' alignItems='center'>
              <Grid item container alignItems='center' xs={6}>
                <IconButton color='primary' onClick={() => changeWeek('prev')}>
                  <ArrowBackIosIcon />
                </IconButton>

                <Typography className={dis ? classes.clr : ''}>
                  {newWeek && endWeek && `${changeDate(newWeek)} - ${changeDate(endWeek)}`}
                </Typography>

                <IconButton color='primary' onClick={() => changeWeek('next')}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Grid>
              <Grid
                container={dis}
                alignItems='center'
                justifyContent='flex-end'
                item
                xs={dis && 6}
              >
                {dis && (
                  <>
                    <CheckCircleOutlineIcon className={classes.clr} />{' '}
                    <Typography className={classes.typo}>Week published on {publish}</Typography>
                  </>
                )}
                <Button
                  className={classes.addShiftBtn}
                  variant='outlined'
                  onClick={() => history.push('/shift/add')}
                  disabled={dis}
                >
                  ADD SHIFT
                </Button>
                <Button
                  className={classes.publishBtn}
                  variant='contained'
                  onClick={() => onPublish()}
                  disabled={dis}
                >
                  PUBLISH
                </Button>
              </Grid>
            </Grid>
            {errMsg.length > 0 ? <Alert severity='error'>{errMsg}</Alert> : <></>}
            <DataTable columns={columns} data={rows} pagination progressPending={isLoading} />
          </CardContent>
        </Card>
      </Grid>
      <ConfirmDialog
        title='Delete Confirmation'
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
    </Grid>
  );
};

export default Shift;
