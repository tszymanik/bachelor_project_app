import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';

import PageHeader from '../../../../../../../common/page/header/PageHeader';
import PageTitle from '../../../../../../../common/page/title/PageTitle';
import PageSubtitle from '../../../../../../../common/page/subtitle/PageSubtitle';
import Container from '../../../../../../../common/page/container/Container';
import Row from '../../../../../../../common/page/row/Row';
import Sidebar from '../../../../../../../common/page/sidebar/Sidebar';
import AdminUserSidebarNav from '../../../../../../../common/page/sidebar/nav/admin/user/AdminUserSidebarNav';
import Content from '../../../../../../../common/page/content/Content';
import Table from '../../../../../../../common/table/Table';
import TableHead from '../../../../../../../common/table/head/TableHead';
import TableBody from '../../../../../../../common/table/body/TableBody';
import TableRow from '../../../../../../../common/table/row/TableRow';
import TableCell from '../../../../../../../common/table/cell/TableCell';
import TableHeaderCell from '../../../../../../../common/table/cell/header/TableHeaderCell';
import ButtonPrimary from '../../../../../../../common/button/primary/ButtonPrimary';
import Modal from '../../../../../../../common/modal/Modal';

class MarksSemesterPage extends Component {
  state = {
    marks: [],
    modal: {
      show: false,
      params: {
        markId: '',
      },
    },
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const marksResponse = await axios.get('/marks', {
      headers: {
        Authorization: `Bearer ${this.props.token}`,
      },
      params: {
        educationItemId: this.props.match.params.educationItemId,
        semesterNumber: this.props.match.params.semesterNumber,
      },
    });
    const marksData = marksResponse.data;

    const marks = [];

    await Promise.all(marksData.map(async (markData) => {
      const subjectResponse = await axios.get(`/subjects/${markData.subjectId}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      });
      const subjectData = subjectResponse.data;

      const teacherResponse = await axios.get(`/users/${markData.teacherId}`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      });
      const teacherData = teacherResponse.data;

      const mark = {
        id: markData.id,
        value: markData.value,
        ectsPoints: subjectData.ectsPoints,
        createdDate: markData.createdDate,
        subjectName: subjectData.name,
        teacherFullName: `${teacherData.firstName} ${teacherData.lastName}`,
        termNumber: markData.termNumber,
        typeOfSubject: markData.typeOfSubject,
        typeOfTerm: markData.typeOfTerm,
      };
      marks.push(mark);
    }));

    this.setState({
      marks,
    });
  }

  handleShowModal = markId => () => {
    const modal = { ...this.state.modal };
    modal.show = true;
    modal.params.markId = markId;

    this.setState({
      modal,
    });
  }

  handleHideModal = () => {
    const modal = { ...this.state.modal };
    modal.show = false;
    modal.params.markId = '';

    this.setState({
      modal,
    });
  }

  handleDeleteMark = () => {
    axios.delete(
      `/marks/${this.state.modal.params.markId}`,
      {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
      },
    )
      .then(() => {
        const modal = { ...this.state.modal };
        modal.show = false;

        let marks = [...this.state.marks];
        marks = marks.filter(mark => mark.id !== this.state.modal.params.markId);

        this.setState({
          modal,
          marks,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    let modal = null;
    if (this.state.modal.show) {
      modal = <Modal title="Usuń ocenę" hide={this.handleHideModal} confirm={this.handleDeleteMark}>Czy na pewno usunąć ocenę?</Modal>;
    }

    return (
      <Fragment>
        {modal}
        <PageHeader>
          <PageTitle>Oceny</PageTitle>
          <PageSubtitle>Semestr {this.props.match.params.semesterNumber}</PageSubtitle>
        </PageHeader>
        <Container>
          <Row>
            <Sidebar>
              <AdminUserSidebarNav
                userId={this.props.match.params.userId}
                educationItemId={this.props.match.params.educationItemId}
              />
            </Sidebar>
            <Content>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Lp.</TableHeaderCell>
                    <TableHeaderCell>Id</TableHeaderCell>
                    <TableHeaderCell>Przedmiot</TableHeaderCell>
                    <TableHeaderCell>Typ przedmiotu</TableHeaderCell>
                    <TableHeaderCell>Ocena</TableHeaderCell>
                    <TableHeaderCell>ECTS</TableHeaderCell>
                    <TableHeaderCell>Data</TableHeaderCell>
                    <TableHeaderCell>Numer terminu</TableHeaderCell>
                    <TableHeaderCell>Nauczyciel</TableHeaderCell>
                    <TableHeaderCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.marks.map((mark, index) => (
                    <TableRow key={mark.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{mark.id}</TableCell>
                      <TableCell>{mark.subjectName}</TableCell>
                      <TableCell>{mark.typeOfTerm}</TableCell>
                      <TableCell>{mark.value}</TableCell>
                      <TableCell>{mark.ectsPoints}</TableCell>
                      <TableCell>{moment(mark.createdDate).format('DD.MM.YYYY')}</TableCell>
                      <TableCell>{mark.termNumber}</TableCell>
                      <TableCell>{mark.teacherFullName}</TableCell>
                      <TableCell>
                        <ButtonPrimary onClick={this.handleShowModal(mark.id)}>Usuń</ButtonPrimary>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Content>
          </Row>
        </Container>
      </Fragment>
    );
  }
}

const mapStateToProps = state => (
  {
    token: state.auth.token,
    userId: state.auth.userId,
  }
);

export default connect(mapStateToProps)(MarksSemesterPage);
