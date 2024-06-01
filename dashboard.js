import app from './initializeFirebase.js';
import { getDatabase, onValue, ref, update } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js';

const database = getDatabase(app);
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(draw);

let totalUsers = 0;
let totalPendingRequest = 0;
let totalDelivery = 0;
let totalPickup = 0;
let dataArray = [
  ['City', '', { role: 'style' }],
  ['Clearance', 0, 'color: #ebe76c;'],
  ['Permit', 0, 'color: #f0b86e'],
  ['Summon', 0, 'color: #ff5f5f'],
  ['Cedula', 0, 'color: #ee9322'],
  ['Residency', 0, 'color: #219c90'],
];

onValue(ref(database, `userinfo`), (users) => {
  document.getElementById('totalUsers').textContent = Object.keys(users.val()).length;
});

onValue(ref(database, `certificates`), (paymentMethods) => {
  clearData();
  Object.keys(paymentMethods.val()).forEach((paymentMethod) => {
    onValue(ref(database, `certificates/${paymentMethod}`), (certificates) => {
      Object.keys(certificates.val()).forEach((certificate) => {
        onValue(ref(database, `certificates/${paymentMethod}/${certificate}`), (users) => {
          Object.keys(users.val()).forEach((user) => {
            onValue(ref(database, `certificates/${paymentMethod}/${certificate}/${user}`), (transactions) => {
              const data = transactions.val();
              for (const index in data) {
                if (data[index]['Status'] == 0) {
                  document.getElementById('totalPendingRequests').textContent = ++totalPendingRequest;
                }
                if (paymentMethod == 'E-Wallet' && data[index]['Delivery Option'] == 'Delivery') {
                  if (data[index]['Status'] == 3) {
                    document.getElementById('totalDelivery').textContent = ++totalDelivery;
                  }
                } else {
                  if (data[index]['Status'] == 3) {
                    document.getElementById('totalPickup').textContent = ++totalPickup;
                  }
                }
                if ((certificate == 'Barangay Clearance') & (data[index]['Status'] == 3)) {
                  dataArray[1][1]++;
                }
                if ((certificate == 'Business Permit') & (data[index]['Status'] == 3)) {
                  dataArray[2][1]++;
                }
                if ((certificate == 'Cedula') & (data[index]['Status'] == 3)) { 
                  dataArray[4][1]++;
                }
                if ((certificate == 'Certificate of Residency') & (data[index]['Status'] == 3)) {
                  dataArray[5][1]++;
                }
                if ((certificate == 'Summon') & (data[index]['Status'] == 3)) {
                  dataArray[3][1]++;
                }
                draw();
              }
            });
          });
        });
      });
    });
  });
});

function draw() {
  var data = google.visualization.arrayToDataTable(dataArray);

  var options = {
    legend: 'none',
    vAxis: {
      title: 'Completed Transactions',
    },
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('graph'));
  chart.draw(data, options);
}

function clearData() {

  totalPendingRequest = 0
  
  dataArray[1][1] = 0;
  dataArray[2][1] = 0;
  dataArray[3][1] = 0;
  dataArray[4][1] = 0;
  dataArray[5][1] = 0;
} 