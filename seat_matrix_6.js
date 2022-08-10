const input = require("./input2.js");

// var input = {}

// let cnt = 0;
// for(college in input1){
//     input[college] = {}
//     for(branch in input1[college]){
//         input[college][branch] = input1[college][branch];
//     }
//     if(++cnt > 50 ) break;
// }

var comm_percent = [0.31,0.265,0.035,0.2,0.15,0.03,0.01];
var comm_order = [6,5,2,4,3,1,0];

// var input = { "clg1" : { "br1" : 39, "br2" : 27, "br3" : 30 ,"br4": 40} ,
//               "clg2" : { "br1" : 32, "br2" : 29, "br3" : 21 ,"br4": 27} ,
//               "clg3" : { "br2" : 36, "br3" : 33, "br4" : 47 ,"br5": 29} 
// }

var floor_matrix = init();
var adjusted_matrix = init();
var seat_matrix = init();
var branch_total = {}, branch_filled = {};
var college_branch_total = {}, college_total = {}, college_tot_comm_seats = {}; 
var total_seats = calculate_total_seats();

for(college in input){ 

    college_branch_total[college] = {};
    college_total[college] = 0;
    college_tot_comm_seats[college] = [0,0,0,0,0,0,0];
    
    for(branch in input[college]){
    
        if( ! branch_total[branch] ){
            branch_total[branch] = [0,0,0,0,0,0,0];
            branch_filled[branch] = [0,0,0,0,0,0,0];
        }

        if( ! college_branch_total[college][branch] ){
            college_branch_total[college][branch] = 0;
        }

        for(let i=0;i<7;i++){
        
            branch_total[branch][i] += input[college][branch] * comm_percent[i];
        
            floor_matrix[college][branch][i] = parseInt( input[college][branch] * comm_percent[i]);
        
            college_branch_total[college][branch] += floor_matrix[college][branch][i];
     
            college_tot_comm_seats[college][i] += floor_matrix[college][branch][i];

            branch_filled[branch][i] += floor_matrix[college][branch][i];
        
        }

        college_total[college] += input[college][branch];
    }
}

var not_filled = 0;

for(branch in branch_total){

    for(comm of comm_order){

        for(let i = branch_filled[branch][comm]; i < parseInt(branch_total[branch][comm]); i++ ){

            let selected_college = "", percentage = 1;

            for(college in input){

                if(college_branch_total[college][branch] < input[college][branch] && adjusted_matrix[college][branch][comm] === 0 ){
                    
                    let college_percentage = college_tot_comm_seats[college][comm] / college_total[college]; 
                    
                    if(college_percentage < percentage){
                        
                        selected_college = college;
                        percentage = college_percentage;

                    }
                }                
            }  
            
            if(selected_college != ""){

                adjusted_matrix[selected_college][branch][comm] = 1; 
            
                college_tot_comm_seats[selected_college][comm] += 1;

                college_branch_total[selected_college][branch] += 1;
            
            }
            else{
                not_filled++;
            }
        }
    }
}

var comm_left_over_seats = [0,0,0,0,0,0,0];
for(let i=0;i<7;i++){
    for(branch in branch_total){
        comm_left_over_seats[i] += (branch_total[branch][i]-parseInt(branch_total[branch][i]));
    }
}

for(comm of comm_order){
    
    let left_seats = parseInt(comm_left_over_seats[comm]);
    
    while(left_seats--){
        
        let selected_college = "", selected_branch = "",percentage = 1;
        for(college in input){

          let college_percentage = college_tot_comm_seats[college][comm] / college_total[college];
            
          if( college_percentage < percentage ){
                
                percentage = college_percentage;

                let mn_dept_percent = 1;
    
                for(branch in input[college]){
                        if(college_branch_total[college][branch] < input[college][branch] && adjusted_matrix[college][branch][comm] === 0){
                            
                            let dept_percent = (floor_matrix[college][branch][comm]) / input[college][branch];
                            if(dept_percent < mn_dept_percent){
                               
                               mn_dept_percent = dept_percent;
                               selected_branch = branch;
                               selected_college = college;

                            }
                        
                        }
                }
            }
            

        }

        if(selected_college != "" && selected_branch != ""){

            adjusted_matrix[selected_college][selected_branch][comm] = 1; 
            
            college_tot_comm_seats[selected_college][comm] += 1;

            college_branch_total[selected_college][selected_branch] += 1;

        }
        else{
            not_filled++;
        }

    }
}



create_final_seatmatrix();
calculate_percentage();
console.log("not filled seats ",not_filled);
console.log("left over seats: ",calculate_final_left_over_seats());

// Utility funtions

function init(){
    let matrix = {}
    for(college in input){
        matrix[college] = {}
        for(branch in input[college]){
            matrix[college][branch] = [0,0,0,0,0,0,0];
        }
    }    
    return matrix;
}

function create_final_seatmatrix(){

    for(college in seat_matrix){
        for(branch in seat_matrix[college]){
            for(let i=0;i<7;i++){
                seat_matrix[college][branch][i] = floor_matrix[college][branch][i] + adjusted_matrix[college][branch][i];
            }
        }
    }

}

function calculate_total_seats(){
    let total = 0;
    for(college in input){
        for(branch in input[college]){
            total += input[college][branch];
        }
    }
    return total;
}

function calculate_percentage(){
    let clg_perc_lst = {};
    for(clg_code in seat_matrix){
        clg_perc_lst[clg_code] = [0,0,0,0,0,0,0];
        for(branch in seat_matrix[clg_code]){
            for(let i=0;i<7;i++){
                clg_perc_lst[clg_code][i] += (seat_matrix[clg_code][branch][i]);
            }
        } 
    }

   let overall_perc_lst = [0,0,0,0,0,0,0];

   for(clg_code in clg_perc_lst){
       for(let i=0;i<7;i++){
          overall_perc_lst[i] += clg_perc_lst[clg_code][i];
       }
   }

   for(let i=0;i<7;i++){
       overall_perc_lst[i] = (overall_perc_lst[i] / total_seats) * 100;
   }
   
   for(clg_code in clg_perc_lst){
       for(let i=0;i<7;i++){
            clg_perc_lst[clg_code][i] =  (clg_perc_lst[clg_code][i] / college_total[clg_code]) * 100;
       }
   }

//    console.log(clg_perc_lst);
//    console.log(overall_perc_lst);
}

function calculate_final_left_over_seats(){
    let seats = 0;
    // console.log(input)
    // console.log(college_branch_total);
    for(college in input){
        for(branch in input[college]){
            seats += input[college][branch] - college_branch_total[college][branch];
            // console.log(input[college][branch],college_branch_total[college][branch])
        }
    }
    return seats;
}