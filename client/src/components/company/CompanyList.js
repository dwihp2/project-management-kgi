import React, { useEffect, useState } from 'react'
import { NavLink as RouterLink } from 'react-router-dom'
import PerfectScrollbar from 'react-perfect-scrollbar'
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Modal,
} from '@material-ui/core'
import { Edit, Trash2 } from 'react-feather'
import { makeStyles } from '@material-ui/core/styles'
import Loading from '../Loading'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchAllCompaniesInfo,
  deleteCompanyById,
} from '../../actions/actionCreators/companyActions'
import { fetchAllUsersInfo } from '../../actions/actionCreators/userActions'

function rand() {
  return Math.round(Math.random() * 20) - 10
}
function getModalStyle() {
  const top = 50 + rand()
  const left = 50 + rand()

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}))
const Timeline = (props) => {
  const classes = useStyles()
  const { token, users, user } = useSelector((state) => state.user)
  const { company, companies, companyLoading } = useSelector(
    (state) => state.company,
  )
  const [openModal, setOpenModal] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [modalStyle] = useState(getModalStyle)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  console.log('token: ', token)
  useEffect(() => {
    dispatch(fetchAllCompaniesInfo(token))
    dispatch(fetchAllUsersInfo(token))
    // dispatch(fetchAllBoards(token))
  }, [dispatch])
  console.log('companies:', companies)
  let mappedTeam = []
  mappedTeam = companies?.map((company) => {
    console.log('company:', company)
    return company.companyTeam.map((team) => {
      console.log('team:', team)
      return users.find((user) => user._id === team)?.username
    })
  })
  console.log('mappedTeam:', mappedTeam)

  const handleClose = () => {
    setOpenModal(false)
  }

  return (
    <>
      {companyLoading ? (
        <Loading />
      ) : (
        <Card {...props}>
          <CardHeader title="Company List" />
          <Divider />
          <PerfectScrollbar>
            <Box sx={{ minWidth: 800 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies?.map((item, index) => (
                    <>
                      <TableRow hover key={item._id}>
                        <TableCell>{item.companyName}</TableCell>
                        <TableCell>{item.companyEmail}</TableCell>
                        <TableCell>{item.companyAddress}</TableCell>
                        <TableCell>
                          {mappedTeam[index]?.join(', ') || '-'}
                        </TableCell>
                        <TableCell>
                          {' '}
                          {item._id !== company.id && (
                            <Button
                              color="secondary"
                              variant="contained"
                              disabled={
                                item._id === company.id || user.role !== 'ADMIN'
                              }
                              onClick={() => {
                                setOpenModal(true)
                                setDeleteId(item._id)
                              }}
                              style={{
                                marginRight: 5,
                              }}
                            >
                              <Trash2 size="20" />
                            </Button>
                          )}
                          <Button
                            component={RouterLink}
                            color="primary"
                            variant="contained"
                            disabled={user.role !== 'ADMIN'}
                            to={`/app/company/edit/${item._id}`}
                          >
                            <Edit size="20" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <Modal open={openModal} onClose={handleClose}>
                        <div style={modalStyle} className={classes.paper}>
                          <h2 style={{ padding: 5 }}>Delete Company</h2>
                          <p style={{ padding: 5 }}>
                            {` Are you sure you want to delete this company ${deleteId}?  `}
                          </p>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              p: 2,
                            }}
                          >
                            <Button
                              color="secondary"
                              variant="contained"
                              style={{ marginRight: 15 }}
                              onClick={() =>
                                dispatch(deleteCompanyById(deleteId, token))
                                  .then(() => {
                                    setOpenModal(false)
                                  })
                                  .then(() => {
                                    navigate('/app/company', {
                                      replace: 'true',
                                    })
                                  })
                              }
                            >
                              Yes
                            </Button>
                            <Button
                              color="primary"
                              variant="contained"
                              onClick={() => setOpenModal(false)}
                            >
                              No
                            </Button>
                          </Box>
                        </div>
                      </Modal>
                    </>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </PerfectScrollbar>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 2,
            }}
          ></Box>
        </Card>
      )}
    </>
  )
}

export default Timeline
