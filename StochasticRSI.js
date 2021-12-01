/*
The file "indicator_history.csv" contains records of the previous Stochastic RSI calculation.
The following function extracts the data of previous records which includes upEWM,downEWM,RSI,Stochastic RSI
and FastK from the file "indicator_history.csv" which are required for the calculation of the current Stochastic RSI.
*/
function get_past_data() {
	var fs=require('fs');
	var content = fs.readFileSync('indicator_history.csv','utf8');
	var data=content.split('\n');
	var rows=data.length-1;
	var rsiArr=[];
	var stochRSIArr=[];
	var fastKArr=[];	
	
	//extract close price
	close=parseFloat(data[1].split(',')[0]);

	//extract upEWM
	upEWM=parseFloat(data[1].split(',')[1]);

	//extract downEWM
	downEWM=parseFloat(data[1].split(',')[2]);

	//extract RSI
	for(let i=1;i<rows;i++) {
		rsiArr.push(parseFloat(data[i].split(',')[3]));
	}

	//extract Stochastic RSI and FastK
	for(let i=12;i<rows;i++) {
		stochRSIArr.push(parseFloat(data[i].split(',')[4]));
		fastKArr.push(parseFloat(data[i].split(',')[5]));
	}

	/*
	console.log(close);
	console.log(upEWM);
	console.log(downEWM);
	console.log(rsiArr);
	console.log(stochRSIArr);
	console.log(fastKArr);
	*/
	return [close,upEWM,downEWM,rsiArr,stochRSIArr,fastKArr];
}

/*
The following function calculates the current period's Stochastic RSI and updates the file
"indicator_history.csv" to be used for calculation of next period's Stochastic RSI.
*/
function StochasticRSI(close) {
	past_data=get_past_data();

	//get past data
	past_close=past_data[0];
	past_upEWM=past_data[1];
	past_downEWM=past_data[2];
	past_rsiArr=past_data[3];
	past_stochRSIArr=past_data[4];
	past_fastKArr=past_data[5];

	//calculate current Stochastic RSI
	change=close-past_close;
	up=0,down=0;
	if(change>0) {
		up=change;
	}
	else {
		down=Math.abs(change);
	}
	upEWM=(past_upEWM*13+up)/14;
	downEWM=(past_downEWM*13+down)/14;
	rs=upEWM/downEWM;
	rsi=(100-100/(1+rs));

	//updating the rsiArray with the value of current RSI
	past_rsiArr.push(rsi);

	past_min_rsi=Math.min.apply(null,past_rsiArr);
	past_max_rsi=Math.max.apply(null,past_rsiArr);

	stochRSI=(rsi-past_min_rsi)/(past_max_rsi-past_min_rsi);
	past_stochRSIArr.push(stochRSI);
	let average = (array) => array.reduce((a, b) => a + b) / array.length;
	fastK=average(past_stochRSIArr);
	past_fastKArr.push(fastK);
	fastD=average(past_fastKArr);

	/*
	console.log(close);
	console.log(upEWM);
	console.log(downEWM);
	console.log(rsi);
	console.log(stochRSI);
	console.log(fastK);
	console.log(fastD);	
	*/

	//update CSV file "indicator_history.csv" with new data.
	closeArray= Array.apply(null, Array(13)).map(function () {});
	upEWMArray= Array.apply(null, Array(13)).map(function () {});
	downEWMArray= Array.apply(null, Array(13)).map(function () {});
	stochRSIArray= Array.apply(null, Array(13)).map(function () {});
	fastKArray= Array.apply(null, Array(13)).map(function () {});

	closeArray[0]=close;
	upEWMArray[0]=upEWM;
	downEWMArray[0]=downEWM;
	
	stochRSIArray[11]=past_stochRSIArr[1];
	stochRSIArray[12]=past_stochRSIArr[2];

	fastKArray[11]=past_fastKArr[1];
	fastKArray[12]=past_fastKArr[2];

	dataToWrite=[['Close','upEWM','downEWM','RSI','StochRSI','FastK']];
	for(let i=0;i<13;i++) {
		toPush=[closeArray[i],upEWMArray[i],downEWMArray[i],past_rsiArr[i+1],stochRSIArray[i],fastKArray[i]];
		dataToWrite.push(toPush);
		//console.log(toPush);
	}

	var csvContent = "";

	var fs=require('fs');
	dataToWrite.forEach(function(rowArray) {
	let row = rowArray.join(",");
	csvContent += row + "\r\n";
	});

	fs.writeFile('indicator_history.csv',csvContent,'utf8', function (err) {
	if (err) {
	console.log(err);
	}
	else{
	console.log('File indicator_history.csv updated!');
	}
	});
	return [fastK,fastD]; //return value of current FastK and FastD.
}

latest_close_price=process.argv[2];
if(latest_close_price) {
	console.log(StochasticRSI(parseFloat(latest_close_price)));
}
else {
	console.log('Please enter the latest closing price of the stock as an argument');
}