import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import moment from 'moment'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Select,
  MenuItem,
  OutlinedInput,
  InputLabel,
  FormControl,
} from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import DatePicker from '@material-ui/lab/DatePicker'
import { Formik } from 'formik'
import * as Yup from 'yup'
import midString from '../../ordering/ordering'
import { useDispatch, useSelector } from 'react-redux'
import { createNewBoard } from '../../actions/actionCreators/boardActions'
import {
  createNewList,
  updateListById,
} from '../../actions/actionCreators/listActions'
import { fetchAllCompaniesInfo } from '../../actions/actionCreators/companyActions'
import {
  fetchAllUsersInfo,
  updateUserNotification,
} from '../../actions/actionCreators/userActions'
import { makeid } from '../../utils/randomString'
import Axios from 'axios'
import * as ACTIONS from '../../actions/actions'

const statusOptions = [
  {
    label: 'Kick Off',
    value: 'Kick Off',
  },
  {
    label: 'In Progress',
    value: 'In Progress',
  },
  {
    label: 'Installation & Commissioning',
    value: 'Installation & Commissioning',
  },
  {
    label: 'Validation',
    value: 'Validation',
  },
  {
    label: 'Closed',
    value: 'Closed',
  },
]

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: '120px',
    maxWidth: '300px',
  },
}))

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const CreateProject = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const { token, isValid, user, users, tokenRequest } = useSelector(
    (state) => state.user,
  )
  const { companies } = useSelector((state) => state.company)
  const { loading, boards, newBoard, error } = useSelector(
    (state) => state.boards,
  )
  const [initialData, setInitialData] = useState({})
  const [boardId, setBoardId] = useState('')
  const [boardCreated, setBoardCreated] = useState(false)
  const dispatch = useDispatch()

  const navigate = useNavigate()
  function getStyles() {
    return {
      fontWeight: theme.typography.fontWeightRegular,
    }
  }

  useEffect(() => {
    if (isValid) {
      dispatch(fetchAllCompaniesInfo(token))
      dispatch(fetchAllUsersInfo(token))
    }
  }, [])

  // useEffect(() => {
  //   setBoardId(newBoard)
  // }, [newBoard])
  // useEffect(() => {
  //   console.log('newBoard id', boardId)
  //   const listTitle = 'To-Do'
  //   const text = listTitle.trim().replace(/\s+/g, ' ')
  //   const totalLists = initialData?.columnOrder?.length ?? 0
  //   const postListReq = {
  //     name: text,
  //     boardId: boardId?._id,
  //     order:
  //       totalLists === 0
  //         ? 'n'
  //         : midString(
  //             initialData.columns[initialData.columnOrder[totalLists - 1]]
  //               .order,
  //             '',
  //           ),
  //   }
  //   dispatch(createNewList(postListReq, token)).then(() => {
  //     console.log('done create project')
  //     navigate('/app/projects')
  //   })
  // }, [boardCreated === true])

  const manipulatedCompanies = companies.concat()

  return (
    <Formik
      initialValues={{
        projectName: '',
        projectDescription: '',
        startDate: moment(),
        endDate: moment().add(1, 'months'),
        company: '',
        pic: [],
        status: '',
      }}
      validationSchema={Yup.object().shape({
        projectName: Yup.string().max(255).required('Project name is required'),
        projectDescription: Yup.string()
          .max(255)
          .required('Project description is required'),
        startDate: Yup.date().required('Project start date is required'),
        endDate: Yup.string().required('Project end date is required'),
        pic: Yup.array().required('Project PIC is required'),
        status: Yup.string().required('Project status is required'),
        // company: Yup.string().max(255).required('Project company is required'),
      })}
      onSubmit={(e) => {
        // e.preventDefault()
        console.log('form submit: ', e)
        const postBoardReq = {
          userId: user.id,
          projectName: e.projectName,
          projectDescription: e.projectDescription,
          startDate: e.startDate,
          endDate: e.endDate,
          company: e.company,
          pic: e.pic,
          status: e.status,
        }
        console.log('postBoardReq submit: ', postBoardReq)
        Axios.post('/api/boards', postBoardReq, {
          headers: { 'x-auth-token': token },
        })
          .then((res) => {
            dispatch({ type: ACTIONS.ADD_BOARD, payload: { board: res.data } })
            // const postListReq = {
            // name: text,
            // boardId: res.data._id,
            // order: 'n',
            // order:
            //   totalLists === 0
            //     ? 'n'
            //     : midString(
            //         initialData.columns[initialData.columnOrder[totalLists - 1]]
            //           .order,
            //         '',
            //       ),
            // }
            const taskPhase = [
              {
                name: 'To-Do',
                description: ' ',
                priority: '',
                pic: [],
                boardId: res.data._id,
                order: 'n',
              },
              {
                name: 'On-Progress',
                description: ' ',
                priority: '',
                pic: [],
                boardId: res.data._id,
                order: 'o',
              },
              {
                name: 'Checked',
                description: ' ',
                priority: '',
                pic: [],
                boardId: res.data._id,
                order: 'p',
              },
              {
                name: 'Done',
                description: ' ',
                priority: '',
                pic: [],
                boardId: res.data._id,
                order: 'q',
              },
            ]
            taskPhase.forEach((task) => {
              dispatch(createNewList(task, token))
            })
            navigate('/app/projects')
          })
          .catch((e) => {
            if (e.message === 'Network Error')
              dispatch({ type: ACTIONS.ERROR_BOARD, payload: { error: e } })
            else if (e.response.status === 422)
              dispatch({ type: ACTIONS.VALIDATION_ERROR_BOARD })
          })
        // dispatch(createNewBoard(postBoardReq, token)).then(() => {
        //   setBoardCreated(true)
        // })
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
        setFieldValue,
      }) => (
        <form onSubmit={handleSubmit} autoComplete="off" noValidate {...props}>
          <Card>
            <CardHeader
              subheader="Enter information about your project"
              title="Create Project"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <TextField
                    error={Boolean(touched.projectName && errors.projectName)}
                    fullWidth
                    helperText="Please fill project name"
                    label="Project name"
                    name="projectName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.projectName}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    error={Boolean(
                      touched.projectDescription && errors.projectDescription,
                    )}
                    fullWidth
                    helperText="Please fill project description"
                    label="Project Description"
                    name="projectDescription"
                    rows={4}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    required
                    value={values.projectDescription}
                    variant="outlined"
                    multiline
                  />
                </Grid>
                <Grid item md={4} xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      views={['day', 'month', 'year']}
                      label="Project start date"
                      value={values.startDate}
                      onChange={(e) => {
                        setFieldValue('startDate', e)
                        console.log('values: ', e)
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          helperText="Please fill project start date"
                          variant="outlined"
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item md={4} xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      views={['day', 'month', 'year']}
                      label="Project end date"
                      value={values.endDate}
                      onChange={(e) => {
                        setFieldValue('endDate', e)
                        console.log('values: ', e)
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          helperText="Please fill project end date"
                          variant="outlined"
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item md={4} xs={4}>
                  <div>
                    <FormControl style={{ width: '100%' }}>
                      <InputLabel id="demo-mutiple-name-label">
                        Project Status
                      </InputLabel>
                      <Select
                        // labelId="demo-mutiple-name-label"
                        // id="demo-mutiple-name"
                        value={values.status}
                        onChange={(e) => {
                          setFieldValue('status', e.target.value)
                        }}
                        input={<OutlinedInput label="Status" />}
                        MenuProps={MenuProps}
                        style={{ maxWidth: '100%' }}
                        required
                      >
                        {statusOptions.map((status, id) => (
                          <MenuItem
                            key={`${status.label}-${id}`}
                            value={status.value}
                            style={getStyles()}
                          >
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </Grid>
                <Grid item md={6} xs={12}>
                  <div>
                    <FormControl style={{ width: '100%' }}>
                      <InputLabel id="demo-mutiple-name-label">
                        Project PIC
                      </InputLabel>
                      <Select
                        // labelId="demo-mutiple-name-label"
                        // id="demo-mutiple-name"
                        multiple
                        value={values.pic}
                        onChange={(e) => {
                          setFieldValue('pic', e.target.value)
                        }}
                        input={<OutlinedInput label="PIC" />}
                        MenuProps={MenuProps}
                        style={{ maxWidth: '100%' }}
                        required
                      >
                        {users.map((user) => (
                          <MenuItem
                            key={`${user.username}-${user._id}`}
                            value={user._id}
                            style={getStyles()}
                          >
                            {user.username}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </Grid>
                <Grid item md={6} xs={12}>
                  <div>
                    <FormControl style={{ width: '100%' }}>
                      <InputLabel id="demo-mutiple-name-label">
                        Company
                      </InputLabel>
                      <Select
                        // labelId="demo-mutiple-name-label"
                        // id="demo-mutiple-name"
                        // multiple
                        value={values.company}
                        onChange={(e) =>
                          setFieldValue('company', e.target.value)
                        }
                        input={<OutlinedInput label="Company" />}
                        MenuProps={MenuProps}
                        style={{ maxWidth: '100%' }}
                        required
                      >
                        <MenuItem value="">None</MenuItem>
                        {companies.map((company) => (
                          <MenuItem
                            key={`${company.companyName}-${company._id}`}
                            value={company._id}
                            style={getStyles()}
                          >
                            {company.companyName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                p: 2,
              }}
            >
              <Button
                color="primary"
                variant="contained"
                disabled={isSubmitting}
                type="submit"
              >
                Create Project
              </Button>
            </Box>
          </Card>
        </form>
      )}
    </Formik>
  )
}

export default CreateProject
