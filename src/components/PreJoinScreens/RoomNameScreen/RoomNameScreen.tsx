import React, { ChangeEvent, FormEvent, useState } from 'react';
import {
  Typography,
  makeStyles,
  TextField,
  Grid,
  Button,
  InputLabel,
  Theme,
  Select,
  MenuItem,
  FormControl,
} from '@material-ui/core';
import { useAppState } from '../../../state';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '1.5em 0 2em',
    },
  },
  textFieldContainer: {
    width: '100%',
    height: '60px,',
  },
  continueButton: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

interface RoomNameScreenProps {
  roleName: string;
  roles: string[];
  conditionName: string;
  conditions: string[];
  experimentName: string;
  setRoleName: (name: string) => void;
  setRoles: (roles: string[]) => void;
  setConditionName: (name: string) => void;
  setConditions: (conditions: string[]) => void;
  setExperimentName: (experimentName: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  nameReal: string;
  setNameReal: (nameReal: string) => void;
}

export default function RoomNameScreen({
  roleName,
  roles,
  conditions,
  experimentName,
  conditionName,
  setConditions,
  setRoles,
  setRoleName,
  setConditionName,
  setExperimentName,
  handleSubmit,
  nameReal,
  setNameReal,
}: RoomNameScreenProps) {
  const classes = useStyles();
  const { user, experimentNameG, setExperimentNameG, setConditionNameG, setRoleNameG } = useAppState();
  const experiments = [
    { name: ['Nonverbal Cues Experiment'], conditions: ['1', '2'], roles: ['Teacher', 'Student', 'Researcher'] },
    {
      name: ['I-Whisper Experiment'],
      conditions: ['1', '2'],
      roles: ['Teacher', 'Student 1', 'Student 2', 'Student 3', 'Student 4', 'Student 5', 'Student 6', 'Researcher'],
    },
  ];

  const handleNameChange = (name: string) => {
    setNameReal(name);
  };
  const handleRoleNameChange = (rName: string) => {
    setRoleName(rName);
    setRoleNameG(rName);
  };

  const handleConditionNameChange = (cName: string) => {
    setConditionName(cName);
    setConditionNameG(cName);
  };

  const handleExperimentNameChange = (experimentName: string) => {
    setExperimentName(experimentName);
    setExperimentNameG(experimentName);
    setRoleName('');
    setConditionName('');
    if (experimentName === 'Nonverbal Cues Experiment') {
      setConditions(experiments[0].conditions);
      setRoles(experiments[0].roles);
    } else if (experimentName === 'I-Whisper Experiment') {
      setConditions(experiments[1].conditions);
      setRoles(experiments[1].roles);
    }
  };

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join an Experiment
      </Typography>
      <Typography variant="body1">Select the experiment, the condition, and the role.</Typography>
      <Typography variant="body1">Input your name.</Typography>
      <form onSubmit={handleSubmit}>
        <div className={classes.inputContainer}>
          <div className={classes.textFieldContainer}>
            <Typography variant="subtitle2" gutterBottom>
              Experiment
            </Typography>

            <Select
              id="input-room-name"
              onChange={e => handleExperimentNameChange(e.target.value as string)}
              value={experimentName}
              variant="outlined"
              style={{ minWidth: 270, minHeight: 40 }}
            >
              {experiments.map(e => (
                <MenuItem value={e.name[0]} key={e.name[0]}>
                  {e.name[0]}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={classes.textFieldContainer}>
            <Typography variant="subtitle2" gutterBottom>
              Condition
            </Typography>
            <Select
              disabled={!experimentName}
              id="input-condition-name"
              onChange={e => handleConditionNameChange(e.target.value as string)}
              value={conditionName}
              variant="outlined"
              style={{ minWidth: 90, minHeight: 40 }}
            >
              {conditions!.map(c => (
                <MenuItem value={c} key={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={classes.textFieldContainer}>
            <Typography variant="subtitle2" gutterBottom>
              Role
            </Typography>

            <Select
              disabled={!experimentName}
              id="input-user-name"
              onChange={e => handleRoleNameChange(e.target.value as string)}
              value={roleName}
              variant="outlined"
              style={{ minWidth: 180, minHeight: 40 }}
            >
              {roles!.map(r => (
                <MenuItem value={r} key={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className={classes.textFieldContainer}>
            <Typography variant="subtitle2" gutterBottom>
              Name
            </Typography>

            <TextField
              disabled={!experimentName}
              id="outlined-basic"
              onChange={e => handleNameChange(e.target.value as string)}
              inputProps={{ style: { minWidth: 180, minHeight: 28 } }}
              value={nameReal}
            />
          </div>
        </div>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={!roleName || !experimentName || !conditionName}
            className={classes.continueButton}
          >
            Continue
          </Button>
        </Grid>
      </form>
    </>
  );
}
