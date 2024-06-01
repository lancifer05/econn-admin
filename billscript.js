import app from './initializeFirebase.js';
import { getDatabase, onValue, ref, update } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js';
import { getStorage, getDownloadURL, ref as storageRef } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js';
const database = getDatabase(app);
const storage = getStorage(app)

const table = document.querySelector('tbody');

onValue(ref(database, `Pay Bills`), (types) => {
  table.innerHTML = '';
  Object.keys(types.val()).forEach((type) => {
    onValue(ref(database, `Pay Bills/${type}`), (users) => {
      Object.keys(users.val()).forEach((user) => {
        onValue(ref(database, `Pay Bills/${type}/${user}`), (transaction) => {
          const data = transaction.val();
          for (const index in data) {
            if (data[index]["Status"] == "0") {
              createRow({ type: type, user: user, key: index }, data[index], type, data[index]['Date Created']);
            }
         
          }
          
        
        });
      });
    });
  });
});

function createRow(_pathData, _data, _type, _dateCreated) {
  const row = document.createElement('tr');
  const type = document.createElement('td');
  type.textContent = _type;
  const dateCreated = document.createElement('td');
  dateCreated.textContent = _dateCreated;
  const action = document.createElement('td');
  const seeDetails = document.createElement('button');
  seeDetails.textContent = 'See Details';
  seeDetails.className = 'custom-buttonrequest';

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
  row.appendChild(dateCreated);
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
  getDownloadURL(storageRef(storage, `Bills Payment/${type}/${user}/${data}` ))
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


  const confirm = document.createElement('button');
  const cancel = document.createElement('button');
  confirm.setAttribute('id', 'acceptBtnBills');
  cancel.setAttribute('id', 'rejectBtnBills');
  confirm.textContent = 'Confirm';
  cancel.textContent = 'Cancel';

  confirm.addEventListener('click', (e) => {
    e.preventDefault();
    updateState(path, '3');
    
  });
  cancel.addEventListener('click', (e) => {
    e.preventDefault();
    updateState(path, '-1');
  });
  actionContainer.appendChild(confirm);
  actionContainer.appendChild(cancel);
}

function updateState(path, state) {
  update(ref(database, path), {
    Status: state,
  });

  document.querySelectorAll('.overlay').forEach(overlay=>{
    overlay.style.display = 'none'
    
    })
}