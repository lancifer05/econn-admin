import app from '/initializeFirebase.js';
import { getDatabase, onValue, ref, update } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js';
import { getStorage, getDownloadURL, ref as storageRef } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js';
const database = getDatabase(app);
const storage = getStorage(app);

const table = document.querySelector('tbody');
const filter = document.getElementById('filter');
const overlay = document.querySelector('overlay');

filter.addEventListener('change', () => {
  loadData(filter.value);
});
loadData('*');
function loadData(filter) {
  onValue(ref(database, `certificates`), (serviceTypes) => {
    table.innerHTML = '';
    Object.keys(serviceTypes.val()).forEach((serviceType) => {
      onValue(ref(database, `certificates/${serviceType}`), (types) => {
        Object.keys(types.val()).forEach((type) => {
          onValue(ref(database, `certificates/${serviceType}/${type}`), (users) => {
            Object.keys(users.val()).forEach((user) => {
              onValue(ref(database, `certificates/${serviceType}/${type}/${user}`), (transactions) => {
                const content = transactions.val();
                for (const index in content) {
                  if (serviceType == filter || filter == '*') {
                    if (content[index]['Status'] == '3' || content[index]['Status'] == '-1' || content[index]['Status'] == '-3') {
                      createRow(user, index, type, serviceType, content[index]['Date Created'], content[index]['Status']);
                    }
                  }
                }
              });
            });
          });
        });
      });
    });
  });
}
onValue(ref(database, `Pay Bills`), (types) => {
  Object.keys(types.val()).forEach((type) => {
    onValue(ref(database, `Pay Bills/${type}`), (users) => {
      Object.keys(users.val()).forEach((user) => {
        onValue(ref(database, `Pay Bills/${type}/${user}`), (transaction) => {
          const data = transaction.val();
          for (const index in data) {
            if (data[index]['Status'] == '3' || data[index]['Status'] == '-1') {
              createRowPayment({ type: type, user: user, key: index }, data[index], type, data[index]['Date Created']);
            }
          }
        });
      });
    });
  });
});

const closeBtn = document.querySelectorAll('.closeBtn');
closeBtn.forEach((close) => {
  close.addEventListener('click', () => {
    document.querySelector('.overlay.barangayClearance').style.display = 'none';
    document.querySelector('.overlay.businessPermit').style.display = 'none';
    document.querySelector('.overlay.summon').style.display = 'none';
    document.querySelector('.overlay.certofResidency').style.display = 'none';
    document.querySelector('.overlay.cedula').style.display = 'none';
    document.querySelector('.overlay.ewalletbarangayclearance').style.display = 'none';
    document.querySelector('.overlay.ewalletPermit').style.display = 'none';
    document.querySelector('.overlay.ewalletCedula').style.display = 'none';
    document.querySelector('.overlay.ewalletSummon').style.display = 'none';
    document.querySelector('.overlay.ewalletCertofResidency').style.display = 'none';
  });
});

console.log(closeBtn);

function createRowPayment(_pathData, _data, _type, _dateCreated) {
  const row = document.createElement('tr');
  const type = document.createElement('td');
  type.textContent = _type;
  const dateCreated = document.createElement('td');
  dateCreated.textContent = _dateCreated;
  const action = document.createElement('td');
  const seeDetails = document.createElement('button');
  seeDetails.textContent = 'See Details';
  seeDetails.className = 'custom-buttonrequest';
  const payment = document.createElement('td');
  payment.textContent = _type == 'Day Care Form' ? 'Registration' : '' || _type == 'Senior Citizen Application Form' ? 'Membership' : 'E-Wallet';

  const tdStatus = document.createElement('td');
  const status = document.createElement('button');
  status.classList.add('statusLabel');
  if (_data['Status'] == '3') {
    status.setAttribute('id', 'completedBtn');
    status.textContent = 'Completed';
  } else if (_data['Status'] == '-1') {
    status.setAttribute('id', 'rejectedBtn');
    status.textContent = 'Rejected';
  } else if (_data['Status'] == '-3') {
    status.setAttribute('id', 'rejectedBtn');
    status.textContent = 'Failed';
  }

  tdStatus.appendChild(status);

  document.querySelectorAll('.closeBtn').forEach((e) => {
    e.addEventListener('click', (evt) => {
      evt.preventDefault();
      document.querySelector('.overlay.daycareRegistration').style.display = 'none';
      document.querySelector('.overlay.seniorMembership').style.display = 'none';
      document.querySelector('.overlay.garbageBill').style.display = 'none';
      document.querySelector('.overlay.daycareBill').style.display = 'none';
    });
  });

  seeDetails.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Dataset:', _data); //logging the dataset
    switch (_type) {
      case 'Day Care Form':
        document.querySelector('.overlay.daycareRegistration').style.display = 'flex';
        renderDayCareForm(_data); //render the values here with the parameter _data from this function
        setActionFunctions('.daycareRegistration .action-buttons', `Pay Bills/${_type}/${_pathData.user}/${_pathData.key}`);
        break;
      case 'Day Care Tuition':
        document.querySelector('.overlay.daycareBill').style.display = 'flex';
        renderDayCareTuition(_data);
        loadImage('.daycareBill', _type, _pathData.user, `${_pathData.key}${_data['Date Created']}`);
        setActionFunctions('.daycareBill .action-buttons', `Pay Bills/${_type}/${_pathData.user}/${_pathData.key}`);
        break;
      case 'Garbage Collection':
        document.querySelector('.overlay.garbageBill').style.display = 'flex';
        renderGarbageCollection(_data);
        loadImage('.garbageBill', _type, _pathData.user, `${_pathData.key}${_data['Date Created']}`);
        setActionFunctions('.garbageBill .action-buttons', `Pay Bills/${_type}/${_pathData.user}/${_pathData.key}`);
        break;
      case 'Senior Citizen Application Form':
        document.querySelector('.overlay.seniorMembership').style.display = 'flex';
        renderSeniorMemForm(_data);
        setActionFunctions('.seniorMembership .action-buttons', `Pay Bills/${_type}/${_pathData.user}/${_pathData.key}`);
        break;
      default:
    }
  });

  action.appendChild(seeDetails);
  row.appendChild(type);
  row.appendChild(payment);
  row.appendChild(dateCreated);
  row.appendChild(tdStatus);
  row.appendChild(action);
  table.appendChild(row);
}

//function for rendering values that accepts an object
function renderDayCareForm(data) {
  document.getElementById('studentRegName').textContent = data['Student Name'];
  document.getElementById('studentRegAddress').textContent = data['Student Address'];
  document.getElementById('studentRegGender').textContent = data['Student Sex'];
  document.getElementById('studentRegAge').textContent = data['Student Age'];
  document.getElementById('studentRegBirthdate').textContent = data['Student BirthDate'];
  document.getElementById('studentRegGuardian').textContent = data['Guardian Name'];
}

function renderSeniorMemForm(data) {
  document.getElementById('seniorMemName').textContent = data['Name'];
  document.getElementById('seniorMemBirthDate').textContent = data['Birthdate'];
  document.getElementById('seniorMemBirthPlace').textContent = data['Birthplace'];
  document.getElementById('seniorMemAge').textContent = data['Age'];
  document.getElementById('seniorMemGender').textContent = data['Gender'];
  document.getElementById('seniorMemHeight').textContent = data['Height'];
  document.getElementById('seniorMemWeight').textContent = data['Weight'];
  document.getElementById('seniorMemCivil').textContent = data['Civil Status'];
  document.getElementById('seniorMemCitizenship').textContent = data['Citizenship'];
  document.getElementById('seniorMemMobile').textContent = data['Mobile Number'];
  document.getElementById('seniorMemAddress').textContent = data['Address'];
}

function renderDayCareTuition(data) {
  document.getElementById('daycareBillName').textContent = data['Student Name'];
  document.getElementById('studentRegAddress').textContent = data['Student Address'];
  document.getElementById('daycareBillGuardian').textContent = data['Guardian Name'];

  document.getElementById('DaycbillAccountName').textContent = data['Account Name'];
  document.getElementById('DaycbillAccountNum').textContent = data['Account Number'];
  document.getElementById('DaycbillRefNum').textContent = data['Reference Number'];
}
function renderGarbageCollection(data) {
  document.getElementById('garbageBillName').textContent = data['Name'];
  document.getElementById('garbageBillAddress').textContent = data['Address'];

  document.getElementById('GBillAccountName').textContent = data['Account Name'];
  document.getElementById('GBillAccountNum').textContent = data['Account Number'];
  document.getElementById('GBillRefNum').textContent = data['Reference Number'];
}
function loadImage(reference, type, user, data) {
  getDownloadURL(storageRef(storage, `Bills Payment/${type}/${user}/${data}`))
    .then((url) => {
      console.log(url);
      document.querySelector(`${reference} img`).src = url;
    })
    .catch((err) => {
      console.log(err);
    });
}
function setActionFunctions(reference, path) {
  const actionContainer = document.querySelector(reference);
  actionContainer.innerHTML = '';

  const cancel = document.createElement('button');
  cancel.setAttribute('id', 'rejectBtnBills');
  cancel.textContent = 'Delete';

  cancel.addEventListener('click', (e) => {
    e.preventDefault();
    updateStateBills(path, '-4');
  });
  actionContainer.appendChild(cancel);
}

function updateStateBills(path, state) {
  update(ref(database, path), {
    Status: state,
  });

  document.querySelectorAll('.overlay').forEach((overlay) => {
    overlay.style.display = 'none';
  });
}
///////////////////////////////////////////////////////////////////////
function createRow(_user, _id, _type, _serviceOption, _dateRequested, _status) {
  const row = document.createElement('tr');
  const tdType = document.createElement('td');
  const tdServiceOption = document.createElement('td');
  const tdDateRequested = document.createElement('td');
  const tdStatus = document.createElement('td');
  const status = document.createElement('button');
  status.classList.add('statusLabel');
  if (_status == '3') {
    status.setAttribute('id', 'completedBtn');
    status.textContent = 'Completed';
  } else if (_status == '-1') {
    status.setAttribute('id', 'rejectedBtn');
    status.textContent = 'Rejected';
  } else if (_status == '-3') {
    status.setAttribute('id', 'rejectedBtn');
    status.textContent = 'Failed';
  }

  tdStatus.appendChild(status);
  const tdActionColumn = document.createElement('td');

  tdType.textContent = _type;
  tdServiceOption.textContent = _serviceOption;
  tdDateRequested.textContent = _dateRequested;

  const seeDetails = document.createElement('button');
  seeDetails.textContent = 'See Details';
  seeDetails.className = 'custom-buttonrequest';

  row.appendChild(tdType);
  row.appendChild(tdServiceOption);
  row.appendChild(tdDateRequested);
  row.appendChild(tdStatus);
  row.appendChild(tdActionColumn);
  tdActionColumn.appendChild(seeDetails);
  seeDetails.addEventListener('click', () => {
    console.log(_id, _type, _serviceOption);

    // BARANGAY CLEARANCE ------------------------------------------------------------------------------------------------------------------------

    if (_type == 'Barangay Clearance' && _serviceOption == 'Cash on Delivery') {
      document.querySelector('.overlay.barangayClearance').style.display = 'flex';

      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        loadCodDVBarangayClearance(data['Name'], data['Address'], data['Gender'], data['Age'], data['Purpose'], data['Delivery Name'], data['Delivery Address'], data['Price'], data['Date Created']);
      });

      const actionButtons = document.querySelector('.overlay.barangayClearance .actionButtonsContainerCOD');
      actionButtons.innerHTML = '';
      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Deleted');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });

      actionButtons.appendChild(rejectBtn);
    }

    // BUSINESS PERMIT ------------------------------------------------------------------------------------------------------------------------
    else if (_type == 'Business Permit' && _serviceOption == 'Cash on Delivery') {
      document.querySelector('.overlay.businessPermit').style.display = 'flex';

      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        loadCodDVBarangayPermit(data['Type of Business'], data['Business Name'], data['Owner Name'], data['Business Address'], data['Start Date'], data['Delivery Name'], data['Delivery Address'], data['Price'], data['Date Created']);
      });

      const actionButtons = document.querySelector('.overlay.businessPermit .actionButtonsContainerCOD');

      actionButtons.innerHTML = '';
      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Deleted');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });

      actionButtons.appendChild(rejectBtn);
    }

    // SUMMON ------------------------------------------------------------------------------------------------------------------------
    else if (_type == 'Summon' && _serviceOption == 'Cash on Delivery') {
      document.querySelector('.overlay.summon').style.display = 'flex';

      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        loadCodDVSummon(data['Complainant'], data['Respondent'], data['Purpose'], data['Delivery Name'], data['Delivery Address'], data['Price'], data['Date Created']);
      });

      const actionButtons = document.querySelector('.overlay.summon .actionButtonsContainerCOD');
      actionButtons.innerHTML = '';
      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });

      actionButtons.appendChild(rejectBtn);
    }

    // RESIDENCY ------------------------------------------------------------------------------------------------------------------------
    else if (_type == 'Certificate of Residency' && _serviceOption == 'Cash on Delivery') {
      document.querySelector('.overlay.certofResidency').style.display = 'flex';

      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        loadCodDVResidency(data['Name'], data['Address'], data['Gender'], data['Age'], data['Number of Months'], data['Purpose'], data['Delivery Name'], data['Delivery Address'], data['Price'], data['Date Created']);
      });

      const actionButtons = document.querySelector('.overlay.scertofResidency .actionButtonsContainerCOD');
      actionButtons.innerHTML = '';
      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });
      actionButtons.appendChild(rejectBtn);
    } else if (_type == 'Summon' && _serviceOption == 'Cash on Delivery') {
      document.querySelector('.overlay.summon').style.display = 'flex';

      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        loadCodDVResidency(data['Name'], data['Address'], data['Gender'], data['Age'], data['Number of Months'], data['Purpose'], data['Delivery Name'], data['Delivery Address'], data['Price'], data['Date Created']);
      });

      const actionButtons = document.querySelector('.overlay.summon .actionButtonsContainerCOD');
      actionButtons.innerHTML = '';
      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });

      actionButtons.appendChild(rejectBtn);
    }

    // CEDULA ------------------------------------------------------------------------------------------------------------------------
    else if (_type == 'Cedula' && _serviceOption == 'Cash on Delivery') {
      document.querySelector('.overlay.cedula').style.display = 'flex';

      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        loadCodDVCedula(data['Name'], data['Birthdate'], data['Birthplace'], data['Gender'], data['Civil status'], data['Height'], data['Weight'], data['Citizenship'], data['Mobile Number'], data['Email'], data['Profession'], data['Address'], data['Purpose'], data['Delivery Name'], data['Delivery Address'], data['Price'], data, ['Date Created']);
      });

      const actionButtons = document.querySelector('.overlay.cedula .actionButtonsContainerCOD');
      actionButtons.innerHTML = '';
      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });

      actionButtons.appendChild(rejectBtn);
    }

    // E WALLET BARANAGAY CLEARANCE----------------------------------------------------------------------------------------------
    else if (_type == 'Barangay Clearance' && _serviceOption == 'E-Wallet') {
      document.querySelector('.overlay.ewalletbarangayclearance').style.display = 'flex';
      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);

        getDownloadURL(storageRef(storage, `Proof of Payment/Barangay Clearance/${_user}/${_id}${_dateRequested}`))
          .then((url) => {
            console.log('Image URL', url);
            loadEWPUBarangayClearance(data['Name'], data['Address'], data['Gender'], data['Age'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price'], url);
          })
          .catch((err) => {
            console.log('Error:', err);
            loadEWPUBarangayClearance(data['Name'], data['Address'], data['Gender'], data['Age'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price']);
          });
      });

      const actionButtons = document.querySelector('.overlay.ewalletbarangayclearance .action-buttons');
      actionButtons.innerHTML = '';

      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });
      actionButtons.appendChild(rejectBtn);
    }
    // E WALLET PERMIT----------------------------------------------------------------------------------------------
    else if (_type == 'Business Permit' && _serviceOption == 'E-Wallet') {
      document.querySelector('.overlay.ewalletPermit').style.display = 'flex';
      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);

        getDownloadURL(storageRef(storage, `Proof of Payment/Business Permit/${_user}/${_id}${_dateRequested}`))
          .then((url) => {
            console.log('Image URL', url);
            loadEWALLETBusinessPermit(data['Type of Business'], data['Business Name'], data['Owner Name'], data['Business Address'], data['Start Date'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price'], url);
          })
          .catch((err) => {
            console.log('Error:', err);
            loadEWALLETBusinessPermit(data['Type of Business'], data['Business Name'], data['Owner Name'], data['Business Address'], data['Start Date'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price']);
          });
      });

      const actionButtons = document.querySelector('.overlay.ewalletPermit .action-buttons');
      actionButtons.innerHTML = '';

      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });
      actionButtons.appendChild(rejectBtn);
    }

    // E WALLET CEDULA----------------------------------------------------------------------------------------------
    else if (_type == 'Cedula' && _serviceOption == 'E-Wallet') {
      document.querySelector('.overlay.ewalletCedula').style.display = 'flex';
      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);

        getDownloadURL(storageRef(storage, `Proof of Payment/Cedula/${_user}/${_id}${_dateRequested}`))
          .then((url) => {
            console.log('Image URL', url);
            loadEWALLETCedula(data['Name'], data['Birthdate'], data['Birthplace'], data['Gender'], data['Age'], data['Civil status'], data['Height'], data['Weight'], data['Citizenship'], data['Mobile Number'], data['Email'], data['Profession'], data['Address'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price'], url);
          })
          .catch((err) => {
            console.log('Error:', err);
            loadEWALLETCedula(data['Name'], data['Birthdate'], data['Birthplace'], data['Gender'], data['Age'], data['Civil status'], data['Height'], data['Weight'], data['Citizenship'], data['Mobile Number'], data['Email'], data['Profession'], data['Address'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price']);
          });
      });

      const actionButtons = document.querySelector('.overlay.ewalletCedula .action-buttons');
      actionButtons.innerHTML = '';

      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Delete';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });
      actionButtons.appendChild(rejectBtn);
    }

    // E WALLET SUMMON---------------------------------------------------------------------------------------------
    else if (_type == 'Summon' && _serviceOption == 'E-Wallet') {
      document.querySelector('.overlay.ewalletSummon').style.display = 'flex';
      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);

        getDownloadURL(storageRef(storage, `Proof of Payment/Summon/${_user}/${_id}${_dateRequested}`))
          .then((url) => {
            console.log('Image URL', url);
            loadEWALLETSummon(data['Complainant'], data['Respondent'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price'], url);
          })
          .catch((err) => {
            console.log('Error:', err);
            loadEWALLETSummon(data['Complainant'], data['Respondent'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price']);
          });
      });

      const actionButtons = document.querySelector('.overlay.ewalletSummon .action-buttons');
      actionButtons.innerHTML = '';

      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Reject';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });
      actionButtons.appendChild(rejectBtn);
    }
    // E WALLET RESIDENCY----------------------------------------------------------------------------------------------
    else if (_type == 'Certificate of Residency' && _serviceOption == 'E-Wallet') {
      document.querySelector('.overlay.ewalletCertofResidency').style.display = 'flex';
      onValue(ref(database, `certificates/${_serviceOption}/${_type}/${_user}/${_id}`), (snapshot) => {
        const data = snapshot.val();
        console.log(data);

        getDownloadURL(storageRef(storage, `Proof of Payment/Certificate of Residency/${_user}/${_id}${_dateRequested}`))
          .then((url) => {
            console.log('Image URL', url);
            loadEWALLETResidency(data['Name'], data['Address'], data['Gender'], data['Age'], data['Number of Months'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price'], url);
          })
          .catch((err) => {
            console.log('Error:', err);
            loadEWALLETResidency(data['Name'], data['Address'], data['Gender'], data['Age'], data['Number of Months'], data['Purpose'], data['Account Name'], data['Account Number'], data['Price'], data['Reference Number'], data['Date Created'], data['Delivery Option'], data['Delivery Address'], data['Price']);
          });
      });

      const actionButtons = document.querySelector('.overlay.ewalletCertofResidency .action-buttons');
      actionButtons.innerHTML = '';

      const rejectBtn = document.createElement('button');
      rejectBtn.setAttribute('id', 'rejectBtn');
      rejectBtn.textContent = 'Reject';

      rejectBtn.addEventListener('click', () => {
        console.log('Rejected');
        updateState(`certificates/${_serviceOption}/${_type}/${_user}/${_id}`, '-4');
      });
      actionButtons.appendChild(rejectBtn);
    } else {
      console.log('Not yet implemented');
    }
  });

  table.appendChild(row);
}
function loadCodDVBarangayClearance(name, address, gender, age, purpose, dname, dadress, amount, datecreated) {
  document.getElementById('codBcName').textContent = name;
  document.getElementById('codBcAddress').textContent = address;
  document.getElementById('codBcGender').textContent = gender;
  document.getElementById('codBcAge').textContent = age;
  document.getElementById('codBcPurpose').textContent = purpose;

  document.getElementById('codBcDeliveryName').textContent = dname;
  document.getElementById('codBcDeliveryAddress').textContent = dadress;
  document.getElementById('codBcAmount').textContent = amount;
  document.getElementById('codBcDateCreated').textContent = datecreated;
}

function loadCodDVBarangayPermit(typeOfbusiness, businessName, ownersName, businessAddress, startDate, DeliveryName, DeliveryAddress, BcAmount, DateCreated) {
  document.getElementById('codTypeofBusiness').textContent = typeOfbusiness;
  document.getElementById('codBusinessName').textContent = businessName;
  document.getElementById('codOwnerName').textContent = ownersName;
  document.getElementById('codBusinessAddress').textContent = businessAddress;
  document.getElementById('codBusinessStart').textContent = startDate;

  document.getElementById('codBPDeliveryName').textContent = DeliveryName;
  document.getElementById('codBPDeliveryAddress').textContent = DeliveryAddress;
  document.getElementById('codBPAmount').textContent = BcAmount;
  document.getElementById('codBPDateCreated').textContent = DateCreated;
}
function loadCodDVSummon(SummonCompliant, SummonRespondent, SummonPurpose, SummonDeliveryName, SummonDeliveryAddress, SummonAmount, SummonDateCreated) {
  document.getElementById('codSummonCompliant').textContent = SummonCompliant;
  document.getElementById('codSummonRespondent').textContent = SummonRespondent;
  document.getElementById('codSummonPurpose').textContent = SummonPurpose;

  document.getElementById('codSummonDeliveryName').textContent = SummonDeliveryName;
  document.getElementById('codSummonDeliveryAddress').textContent = SummonDeliveryAddress;
  document.getElementById('codSummonAmount').textContent = SummonAmount;
  document.getElementById('codSummonDateCreated').textContent = SummonDateCreated;
}

function loadCodDVResidency(ResidencyName, ResidencyAddress, ResidencyGender, ResidencyAge, ResidencyPurpose, ResidencyDeliveryName, ResidencyDeliveryAddress, ResidencyAmount, ResidencyDateCreated) {
  document.getElementById('codResidencyName').textContent = ResidencyName;
  document.getElementById('codResidencyAddress').textContent = ResidencyAddress;
  document.getElementById('codResidencyGender').textContent = ResidencyGender;
  document.getElementById('codResidencyAge').textContent = ResidencyAge;
  document.getElementById('codResidencyPurpose').textContent = ResidencyPurpose;

  document.getElementById('codResidencyDeliveryName').textContent = ResidencyDeliveryName;
  document.getElementById('codResidencyDeliveryAddress').textContent = ResidencyDeliveryAddress;
  document.getElementById('codResidencyAmount').textContent = ResidencyAmount;
  document.getElementById('codResidencyDateCreated').textContent = ResidencyDateCreated;
}

function loadCodDVCedula(CedulaName, CedulaBirth, CedulaBPlace, CedulaGender, CedulaStatus, CedulaHeight, CedulaWeight, CedulaCitizenship, CedulaNumber, CedulaEmail, CedulaProfession, CedulaAddress, CedulaPurpose, CDeliveryName, CDeliveryAddress, CAmount, CDateCreated) {
  document.getElementById('codCedulaName').textContent = CedulaName;
  document.getElementById('codCedulaBirth').textContent = CedulaBirth;
  document.getElementById('codCedulaBPlace').textContent = CedulaBPlace;
  document.getElementById('codCedulaGender').textContent = CedulaGender;
  document.getElementById('codCedulaStatus').textContent = CedulaStatus;
  document.getElementById('codCedulaHeight').textContent = CedulaHeight;
  document.getElementById('codCedulaWeight').textContent = CedulaWeight;
  document.getElementById('codCedulaCitizenship').textContent = CedulaCitizenship;
  document.getElementById('codCedulaNumber').textContent = CedulaNumber;
  document.getElementById('codCedulaEmail').textContent = CedulaEmail;
  document.getElementById('codCedulaProfession').textContent = CedulaProfession;
  document.getElementById('codCedulaAddress').textContent = CedulaAddress;
  document.getElementById('codCedulaPurpose').textContent = CedulaPurpose;

  document.getElementById('codCDeliveryName').textContent = CDeliveryName;
  document.getElementById('codCDeliveryAddress').textContent = CDeliveryAddress;
  document.getElementById('codCAmount').textContent = CAmount;
  document.getElementById('codCDateCreated').textContent = CDateCreated;
}

// E-WALLET BARANGAY CLEARANCE

function loadEWPUBarangayClearance(EWname, EWaddress, EWgender, EWage, EWpurpose, EWaccountName, EWaccountNumber, EWamount, EWreferenceNumber, EWDateCreated, EWdeliveryOption, ddBCAddress, ddBCAmount, imageURL) {
  document.querySelector('.Imagereceipt#receipt-image').src = imageURL;
  document.getElementById('ewBCName').textContent = EWname;
  document.getElementById('ewBCAddress').textContent = EWaddress;
  document.getElementById('ewBCGender').textContent = EWgender;
  document.getElementById('ewBCAge').textContent = EWage;
  document.getElementById('ewBCPurpose').textContent = EWpurpose;

  console.log('Service Option: ', EWdeliveryOption);
  document.querySelector('.delivery-info-container').style.display = 'none';
  document.querySelector('.pickup-info-container').style.display = 'none';

  if (EWdeliveryOption == 'Pick up') {
    document.querySelector('.pickup-info-container').style.display = 'flex';
  } else if (EWdeliveryOption == 'Delivery') {
    document.querySelector('.delivery-info-container').style.display = 'flex';
  }

  console.log(EWaccountNumber, EWdeliveryOption, EWamount, EWreferenceNumber);
  document.getElementById('ewBCServiceOption').textContent = EWdeliveryOption;

  document.querySelectorAll('.EWBCAccountName').forEach((accountName) => {
    accountName.textContent = EWaccountName;
  });
  document.querySelectorAll('.EWBCAccountNum').forEach((accountNum) => {
    accountNum.textContent = EWaccountNumber;
  });
  document.querySelectorAll('.EWBCAmmount').forEach((accountAmount) => {
    accountAmount.textContent = EWamount;
  });
  document.querySelectorAll('.EWBCRefNum').forEach((accountRefNum) => {
    accountRefNum.textContent = EWreferenceNumber;
  });

  document.getElementById('ewBCAmount').textContent = EWamount;
  document.getElementById('dvBCDateCreated').textContent = EWDateCreated;
  document.getElementById('DDBCName').textContent = EWname;
  document.getElementById('DDBCAddress').textContent = ddBCAddress;
  document.getElementById('DDBCAmount').textContent = ddBCAmount;
}

// E-WALLET BUSINESS PERMIT

function loadEWALLETBusinessPermit(EWPBusinessType, EWPBusinessName, EWPOwnersName, EWPAddressBusiness, EWPDateStart, EWBPaccountName, EWBPaccountNumber, EWBPamount, EWBPreferenceNumber, EWBPDateCreated, EWBPdeliveryOption, ddBPAddress, ddBPAmount, imageURL) {
  document.querySelector('.PermitImagereceipt#receipt-image').src = imageURL;
  document.getElementById('ewPBusinessType').textContent = EWPBusinessType;
  document.getElementById('ewPBusinessName').textContent = EWPBusinessName;
  document.getElementById('ewPOwnersName').textContent = EWPOwnersName;
  document.getElementById('ewPAddressBusiness').textContent = EWPAddressBusiness;
  document.getElementById('ewPDateStart').textContent = EWPDateStart;

  console.log('Service Option: ', EWBPdeliveryOption);
  document.querySelector('.ewalletPermit .delivery-info-container').style.display = 'none';
  document.querySelector('.ewalletPermit .pickup-info-container').style.display = 'none';

  if (EWBPdeliveryOption == 'Pick up') {
    document.querySelector('.ewalletPermit .pickup-info-container').style.display = 'flex';
  } else if (EWBPdeliveryOption == 'Delivery') {
    document.querySelector('.ewalletPermit .delivery-info-container').style.display = 'flex';
  }

  console.log(EWBPdeliveryOption);
  document.getElementById('PermitServiceOption').textContent = EWBPdeliveryOption;

  document.querySelectorAll('.PUPRTAccountName').forEach((accountName) => {
    accountName.textContent = EWBPaccountName;
  });
  document.querySelectorAll('.PUPRTAccountNum').forEach((accountNum) => {
    accountNum.textContent = EWBPaccountNumber;
  });
  document.querySelectorAll('.PUPRTAmmount').forEach((accountAmount) => {
    accountAmount.textContent = EWBPamount;
  });
  document.querySelectorAll('.PUPRTRefNum').forEach((accountRefNum) => {
    accountRefNum.textContent = EWBPreferenceNumber;
  });

  document.getElementById('dvPAmount').textContent = EWBPamount;
  document.getElementById('dvPDateCreated').textContent = EWBPDateCreated;
  document.getElementById('DDPName').textContent = EWPBusinessType;
  document.getElementById('DDPAddress').textContent = ddBPAddress;
  document.getElementById('DDPAmount').textContent = ddBPAmount;
}

function loadEWALLETCedula(EWCName, EWCBirth, EWCBirthPlace, EWCGender, EWCAge, EWCCivilStatus, EWCHeight, EWCWeight, EWCCitizenship, EWCMobile, EWCEmail, EWCProfession, EWCAddress, EWCPurpose, EWaccountName, EWaccountNumber, EWamount, EWreferenceNumber, EWDateCreated, EWCdeliveryOption, ddBCAddress, ddBCAmount, imageURL) {
  document.querySelector('.CedulaImagereceipt#receipt-image').src = imageURL;
  document.getElementById('ewCName').textContent = EWCName;
  document.getElementById('ewCBirth').textContent = EWCBirth;
  document.getElementById('ewCBirthPlace').textContent = EWCBirthPlace;
  document.getElementById('ewCGender').textContent = EWCGender;
  document.getElementById('ewCAge').textContent = EWCAge;
  document.getElementById('ewCCivilStatus').textContent = EWCCivilStatus;
  document.getElementById('ewCHeight').textContent = EWCHeight;
  document.getElementById('ewCWeight').textContent = EWCWeight;
  document.getElementById('ewCCitizenship').textContent = EWCCitizenship;
  document.getElementById('ewCMobile').textContent = EWCMobile;
  document.getElementById('ewCEmail').textContent = EWCEmail;
  document.getElementById('ewCProfession').textContent = EWCProfession;
  document.getElementById('ewCAddress').textContent = EWCAddress;
  document.getElementById('ewCPurpose').textContent = EWCPurpose;

  console.log('Service Option: ', EWCdeliveryOption);
  document.querySelector('.ewalletCedula .delivery-info-container').style.display = 'none';
  document.querySelector('.ewalletCedula .pickup-info-container').style.display = 'none';

  // DELIVERY OPTION CONDITIONS

  if (EWCdeliveryOption == 'Pick up') {
    document.querySelector('.ewalletCedula .pickup-info-container').style.display = 'flex';
  } else if (EWCdeliveryOption == 'Delivery') {
    document.querySelector('.ewalletCedula .delivery-info-container').style.display = 'flex';
  }

  console.log(EWaccountNumber, EWCdeliveryOption, EWamount, EWreferenceNumber);
  document.getElementById('ewCServiceOption').textContent = EWCdeliveryOption;

  document.querySelectorAll('.EWCAccountName').forEach((accountName) => {
    accountName.textContent = EWaccountName;
  });
  document.querySelectorAll('.EWCAccountNum').forEach((accountNum) => {
    accountNum.textContent = EWaccountNumber;
  });
  document.querySelectorAll('.EWCAmmount').forEach((accountAmount) => {
    accountAmount.textContent = EWamount;
  });
  document.querySelectorAll('.EWCRefNum').forEach((accountRefNum) => {
    accountRefNum.textContent = EWreferenceNumber;
  });

  document.getElementById('ewBCAmount').textContent = EWamount;
  document.getElementById('DDCDateCreated').textContent = EWDateCreated;
  document.getElementById('DDCName').textContent = EWCName;
  document.getElementById('DDCAddress').textContent = ddBCAddress;
  document.getElementById('DDCAmount').textContent = ddBCAmount;
}

// E-WALLET SUMMON

function loadEWALLETSummon(EWcomp, EWresp, EWpurp, EWaccountName, EWaccountNumber, EWamount, EWreferenceNumber, EWDateCreated, EWSdeliveryOption, ddBCAddress, ddBCAmount, imageURL) {
  document.querySelector('.SummonImagereceipt#receipt-image').src = imageURL;
  document.getElementById('ewComp').textContent = EWcomp;
  document.getElementById('ewResp').textContent = EWresp;
  document.getElementById('ewPurp').textContent = EWpurp;

  console.log('Service Option: ', EWSdeliveryOption);
  document.querySelector('.ewalletSummon .delivery-info-container').style.display = 'none';
  document.querySelector('.ewalletSummon .pickup-info-container').style.display = 'none';

  if (EWSdeliveryOption == 'Pick up') {
    document.querySelector('.ewalletSummon .pickup-info-container').style.display = 'flex';
  } else if (EWSdeliveryOption == 'Delivery') {
    document.querySelector('.ewalletSummon .delivery-info-container').style.display = 'flex';
  }

  console.log(EWaccountNumber, EWSdeliveryOption, EWamount, EWreferenceNumber);
  document.getElementById('ewBCServiceOption').textContent = EWSdeliveryOption;

  document.querySelectorAll('.EWCOMPAccountName').forEach((accountName) => {
    accountName.textContent = EWaccountName;
  });
  document.querySelectorAll('.EWCOMPAccountNum').forEach((accountNum) => {
    accountNum.textContent = EWaccountNumber;
  });
  document.querySelectorAll('.EWCOMPAmmount').forEach((accountAmount) => {
    accountAmount.textContent = EWamount;
  });
  document.querySelectorAll('.EWCOMPRefNum').forEach((accountRefNum) => {
    accountRefNum.textContent = EWreferenceNumber;
  });

  document.getElementById('DDCOMPAmount').textContent = EWamount;
  document.getElementById('DCOMPDateCreated').textContent = EWDateCreated;
  document.getElementById('DDCOMPName').textContent = EWcomp;
  document.getElementById('DDCOMPAddress').textContent = ddBCAddress;
  document.getElementById('DDBCAmount').textContent = ddBCAmount;
}

// E-WALLET RESIDENCY

function loadEWALLETResidency(EWname, EWaddress, EWgender, EWage, EWproof, EWpurpose, EWaccountName, EWaccountNumber, EWamount, EWreferenceNumber, EWDateCreated, EWRdeliveryOption, ddBCAddress, ddBCAmount, imageURL) {
  document.querySelector('.ResidencyImagereceipt#receipt-image').src = imageURL;
  document.getElementById('EWRESName').textContent = EWname;
  document.getElementById('EWRESAddress').textContent = EWaddress;
  document.getElementById('EWRESGender').textContent = EWgender;
  document.getElementById('EWRESAge').textContent = EWage;
  document.getElementById('EWRESProof').textContent = EWproof;
  document.getElementById('EWRESPurpose').textContent = EWpurpose;

  console.log('Service Option: ', EWRdeliveryOption);
  document.querySelector('.ewalletCertofResidency .delivery-info-container').style.display = 'none';
  document.querySelector('.ewalletCertofResidency .pickup-info-container').style.display = 'none';

  if (EWRdeliveryOption == 'Pick up') {
    document.querySelector('.ewalletCertofResidency .pickup-info-container').style.display = 'flex';
  } else if (EWRdeliveryOption == 'Delivery') {
    document.querySelector('.ewalletCertofResidency .delivery-info-container').style.display = 'flex';
  }

  console.log(EWaccountNumber, EWRdeliveryOption, EWamount, EWreferenceNumber);
  document.getElementById('ewaRESServiceOption').textContent = EWRdeliveryOption;

  document.querySelectorAll('.EWRESAccountName').forEach((accountName) => {
    accountName.textContent = EWaccountName;
  });
  document.querySelectorAll('.EWRESAccountNum').forEach((accountNum) => {
    accountNum.textContent = EWaccountNumber;
  });
  document.querySelectorAll('.EWRESAmmount').forEach((accountAmount) => {
    accountAmount.textContent = EWamount;
  });
  document.querySelectorAll('.EWRESRefNum').forEach((accountRefNum) => {
    accountRefNum.textContent = EWreferenceNumber;
  });

  document.getElementById('ewaRESAmount').textContent = EWamount;
  document.getElementById('ewaRESDateCreated').textContent = EWDateCreated;
  document.getElementById('ewaRESName').textContent = EWname;
  document.getElementById('ewaRESAddress').textContent = ddBCAddress;
  document.getElementById('ewaRESAmount').textContent = ddBCAmount;
}

// REGISTRATION AND MEMBERSHIP FORMS

function updateState(path, state) {
  update(ref(database, path), {
    Status: state,
  });

  document.querySelectorAll('.overlay').forEach(overlay=>{
    overlay.style.display = 'none'
    
    })
}
