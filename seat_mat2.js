const data = require("./data.json");
var fs = require('fs');
const {DEPT_LIST,COLLEGES_LIST} = require('./input.js');  


let listclgcode = [];
data.forEach((c) => {
	if (!listclgcode.includes(c["COLLEGE CODE"])) {
		listclgcode.push(c["COLLEGE CODE"]);
	}
});


const list2 = [];
for (var i = 0; i < listclgcode.length; i++) {
	const list1 = [];
	for (var j = 0; j < data.length; j++) {
		if (data[j]["COLLEGE CODE"] == listclgcode[i]) {
			list1.push(data[j].total);
		}
	}
	list2.push(list1);
}



let oc = 0.31, bc = 0.265, bcm = 0.035, mbc = 0.2, sc = 0.15, sca = 0.03, st = 0.01;
let abs_seat = [], frc_seat = [], dif = [], order = [6,5,2,4,3,1,0], tot_comm_abs_seat = [],tot_comm_frc_seat = [];
let original_matrix = [], seat_matrix = [], adjusted = [], max_order = [];
// let seat_alloc = [[66,45,67,89],[34,56,45,89,34],[67,34,56,32,46]];
let seat_alloc = list2;
let tot_colleges = seat_alloc.length;
let final = [], adj_order = [];

console.log(tot_colleges)
console.log(seat_alloc)

max_order[0] = [], max_order[1] = [], max_order[2] = [],max_order[3] = [];
max_order[4] = [], max_order[5] = [], max_order[6] = [];

for(let i=0;i<tot_colleges;i++){
    for(dept of seat_alloc[i]){
       dept = parseFloat(dept)
       let oc_abs  = parseInt(dept*oc),  oc_frc  = parseFloat((dept*oc) - oc_abs);
       let bc_abs  = parseInt(dept*bc),  bc_frc  = parseFloat((dept*bc) - bc_abs);
       let bcm_abs = parseInt(dept*bcm), bcm_frc = parseFloat((dept*bcm) - bcm_abs);
       let mbc_abs = parseInt(dept*mbc), mbc_frc = parseFloat((dept*mbc) - mbc_abs);
       let sc_abs  = parseInt(dept*sc),  sc_frc  = parseFloat((dept*sc) - sc_abs);
       let sca_abs = parseInt(dept*sca), sca_frc = parseFloat((dept*sca) - sca_abs);
       let st_abs  = parseInt(dept*st),  st_frc  = parseFloat((dept*st) - st_abs);

       original_matrix.push([dept*oc,dept*bc,dept*bcm,dept*mbc,dept*sc,dept*sca,dept*st]);
       seat_matrix.push([oc_abs,bc_abs,bcm_abs,mbc_abs,sc_abs,sca_abs,st_abs]);
       
       abs_seat.push([oc_abs,bc_abs,bcm_abs,mbc_abs,sc_abs,sca_abs,st_abs]);
       frc_seat.push([oc_frc,bc_frc,bcm_frc,mbc_frc,sc_frc,sca_frc,st_frc]);

       max_order[0].push([oc_frc,seat_matrix.length-1]);
       max_order[1].push([bc_frc,seat_matrix.length-1]);
       max_order[2].push([bcm_frc,seat_matrix.length-1]);
       max_order[3].push([mbc_frc,seat_matrix.length-1]);
       max_order[4].push([sc_frc,seat_matrix.length-1]);
       max_order[5].push([sca_frc,seat_matrix.length-1]);
       max_order[6].push([st_frc,seat_matrix.length-1]);

       let abs_sum = [oc_abs,bc_abs,bcm_abs,mbc_abs,sc_abs,sca_abs,st_abs].reduce((a,b) => a+b);
       dif.push(dept-abs_sum);

       adjusted.push([0,0,0,0,0,0,0]);
    }
}

for(let i=0;i<7;i+=1){
  let sum1 = 0, sum2 = 0;
  for(item of original_matrix){
      sum1 += parseInt(item[i]);
      sum2 += parseFloat(item[i]);
  }
  sum2 = sum2 - sum1;
  tot_comm_abs_seat.push(sum1);
  tot_comm_frc_seat.push(sum2);
  max_order[i].sort((a,b) => b[0]-a[0]);
}

for(let i=0;i<7;i++){
  let j = order[i], k = parseInt(0);
  let row = max_order[j][k][1];
  while(tot_comm_frc_seat[j] >= 1){

    if(dif[row] > 0){
      adjusted[row][j] = 1;
      dif[row]--;
      tot_comm_frc_seat[j]--;
    }
    
    k = parseInt(k+1)%seat_matrix.length;

    row = max_order[j][k][1];
  
  }
}

// adjusting left over seats

// let left_over = dif.reduce( (a,b) => a+b);

// for(it in tot_comm_frc_seat){
//     adj_order.push([tot_comm_frc_seat[it],parseInt(it)]);
// }
// adj_order.sort((a,b) => b[0]-a[0]);

// for(let i=0;i<7 && left_over > 0;i++){
//     let j = parseInt(adj_order[i][1]),k = parseInt(0);
//     let row = max_order[j][k][1];
//     while(adjusted[row] === 1 || dif[row] === 0){
//         k++;
//         if(k >= seat_matrix.length) break;
//         row = max_order[j][k][1];
//     }
//     if( k < seat_matrix.length ){
//       adjusted[row][j] = 1;
//       dif[row]--;  
//     }
// }

// adding adjustment seats to seat matrix

for(let i=0;i<seat_matrix.length;i++){
  for(let j=0;j<7;j++){
    seat_matrix[i][j] = seat_matrix[i][j] + parseInt(adjusted[i][j]);
  }
}

console.log(seat_matrix)

let percentage = [];
let pos = 0;
for(let j=0;j<tot_colleges;j++){
  let lst = [];
  for(var k=0;k<7;k++){

    let dept_tot = 0,act_tot = 0;
  
    for(let it=0;it < seat_alloc[j].length;it++){
       dept_tot += seat_alloc[j][it];
    } 
    for(let i=0;i<seat_alloc[j].length;i++){
       act_tot += seat_matrix[i+pos][k];
    }
    lst.push((act_tot/dept_tot)*100);
  }
 percentage.push(lst);
 pos += seat_alloc[j].length;
}

let prev = 0;
for(let i=0;i<tot_colleges;i++){
  final[i] = {};
  final[i]["clgcode"] = COLLEGES_LIST[i].key;
  final[i]["clgname"] = COLLEGES_LIST[i].label;
  let tot = 0;
  for(item of seat_alloc[i]){
    tot += item;
  }
  final[i]["clgtotal"] = tot;
  let clg_seat_mat = [],clg_adjust = [], absolute = [], comm_tot_seats = [0,0,0,0,0,0,0];
  for(let j=0;j<seat_alloc[i].length;j++){
      clg_seat_mat.push(seat_matrix[j+prev]);
      clg_adjust.push(adjusted[j+prev]);
      absolute.push(abs_seat[j+prev]);
      comm_tot_seats[0] += seat_matrix[j+prev][0];
      comm_tot_seats[1] += seat_matrix[j+prev][1];
      comm_tot_seats[2] += seat_matrix[j+prev][2];
      comm_tot_seats[3] += seat_matrix[j+prev][3];
      comm_tot_seats[4] += seat_matrix[j+prev][4];
      comm_tot_seats[5] += seat_matrix[j+prev][5];
      comm_tot_seats[6] += seat_matrix[j+prev][6];
  }
  prev += seat_alloc[i].length;
  final[i]["clgseatmatrix"] = clg_seat_mat;
  final[i]["clgadjustment"] = clg_adjust;
  final[i]["clgabsolute"] = absolute;
  final[i]["clgpercentage"] = percentage[i];
  final[i]["oc"] = comm_tot_seats[0];
  final[i]["bc"] = comm_tot_seats[1];
  final[i]["bcm"] = comm_tot_seats[2];
  final[i]["mbc"] = comm_tot_seats[3];
  final[i]["sc"] = comm_tot_seats[4];
  final[i]["sca"] = comm_tot_seats[5];
  final[i]["st"] = comm_tot_seats[6];
}

overall_percentage = [0,0,0,0,0,0,0];
for(item of percentage){
  overall_percentage[0] += item[0];
  overall_percentage[1] += item[1];
  overall_percentage[2] += item[2];
  overall_percentage[3] += item[3];
  overall_percentage[4] += item[4];
  overall_percentage[5] += item[5];
  overall_percentage[6] += item[6];
}

overall_percentage[0] /= tot_colleges;
overall_percentage[1] /= tot_colleges;
overall_percentage[2] /= tot_colleges;
overall_percentage[3] /= tot_colleges;
overall_percentage[4] /= tot_colleges;
overall_percentage[5] /= tot_colleges;
overall_percentage[6] /= tot_colleges;




var json = JSON.stringify(seat_matrix);
fs.writeFile('output.json', json, 'utf8',()=>{console.log("written")});


// var Results = seat_matrix;

// exportToCsv = function() {
//   var CsvString = "";
//   Results.forEach(function(RowItem, RowIndex) {
//       RowItem.forEach(function(ColItem, ColIndex) {
//           CsvString += ColItem + ',';
//       });
//       CsvString += "\r\n";
//   });
//   window.open('data:application/vnd.ms-excel,' + encodeURIComponent(CsvString));
// }

// exportToCsv();

console.log(overall_percentage)

let summ = dif.reduce((a,b) => a+b);
console.log(summ);

// console.log(adjusted)