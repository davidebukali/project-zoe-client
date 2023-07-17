import React, { Fragment, useEffect, useState } from 'react';
import {
  createStyles, Button, makeStyles, Theme, Typography,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { useDispatch, useSelector } from 'react-redux';
import XTable from '../../components/table/XTable';
import Loading from '../../components/Loading';
import { IMobileRow } from '../../components/DataList';
import PersonAvatar from '../../components/PersonAvatar';
import ListHeader from '../../components/ListHeader';
import { IEvent } from '../events/types';
import { IReportState, reportsConstants } from '../../data/reports/reducer';
import { localRoutes, remoteRoutes } from '../../data/constants';
import { search } from '../../utils/ajax';
import { ReportProps } from './types';
import ReportSubmissionDetail from './ReportSubmissionDetail';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  filterPaper: {
    borderRadius: 0,
    padding: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const ReportSubmissions = (reportProps: ReportProps) => {
  const { report, onBackToList } = reportProps;
  const dispatch = useDispatch();
  const [filter, setFilter] = useState<any>({ limit: 5000 });
  const classes = useStyles();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const history = useHistory();

  const { data, loading }: IReportState = useSelector(
    (state: any) => state.reports,
  );

  const handleRowSelection = (reportSubmissionId: string) => {
    setSelectedRowId(reportSubmissionId);
    history.push(`${localRoutes.reports}/${report.id}/submissions/${reportSubmissionId}`);
  };
  
  const toMobileRow = (personData: IEvent): IMobileRow => ({
    avatar: <PersonAvatar data={personData} />,
    primary: report.name,
    secondary: (
        <>
        </>
    ),
  });

  useEffect(() => {
    dispatch({
      type: reportsConstants.reportsFetchLoading,
      payload: true,
    });
    search(
      `${remoteRoutes.reports}/${report.id}/submissions`,
      filter,
      (resp) => {
        dispatch({
          type: reportsConstants.reportsFetchOne,
          payload: resp,
        });
      },
      undefined,
      () => {
        dispatch({
          type: reportsConstants.reportsFetchLoading,
          payload: false,
        });
      },
    );
  }, [filter, dispatch]);

  return (
    <>
      <Box p={1} className={classes.root}>
        <Box mt={2}>
          <Typography variant="button" className={classes.title}>
            { report.name } submissions
          </Typography>
        </Box>
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={onBackToList}>
            Back to Report List
          </Button>
        </Box>
        <ListHeader
          title="Report Submissions"
          onFilter={setFilter}
          filter={filter}
          showBreadCrumbs={false}
          enableFiltering={false}
          loading={loading}
        />
        <Hidden smDown>
          <Box pt={1}>
            {loading || !data.data ? (
              <Loading />
            ) : (

              <XTable
                headCells={data.columns || []}
                data={data.data || []}
                initialRowsPerPage={10}
                handleSelection={handleRowSelection}
                initialSortBy="smallGroupName"
              />
            )}
          </Box>
        </Hidden>
        <Hidden mdUp>
          <List>
            {loading || !data?.data ? (
              <Loading />
            ) : (
              data.data.map((row: any) => {
                const mobileRow = toMobileRow(row);
                return (
                  <Fragment key={row.id}>
                    <ListItem
                      alignItems="flex-start"
                      button
                      disableGutters
                    >
                      <ListItemAvatar>{mobileRow.avatar}</ListItemAvatar>
                      <ListItemText
                        primary={mobileRow.primary}
                        secondary={mobileRow.secondary}
                      />
                    </ListItem>
                    <Divider component="li" />
                  </Fragment>
                );
              })
            )}
          </List>
        </Hidden>
      </Box>
    </>
  );
};

export default ReportSubmissions;
