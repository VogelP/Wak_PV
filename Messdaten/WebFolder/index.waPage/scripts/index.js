
WAF.onAfterInit = function onAfterInit() {// @lock

// @region namespaceDeclaration// @startlock
	var b_2 = {};	// @button
	var b_delSelection = {};	// @button
	var b_1 = {};	// @button
	var documentEvent = {};	// @document
	var dg_Sensoren = {};	// @dataGrid
	var Kalender1 = {};	// @calendar
// @endregion// @endlock

// eventHandlers// @lock

	b_2.click = function b_2_click (event)// @startlock
	{// @endlock
		//alle Sensoren acktualisieren
		//rufe hierfür einen Web-service mit normalem HTTP-GET auf
		var rq = new XMLHttpRequest();
		rq.addEventListener("load", function(evt) {
			alert(evt.target.responseText);
		}, false);
		rq.open('GET','/aktualisiereMessdaten',true);
		rq.send();

	};// @lock

	b_delSelection.click = function b_delSelection_click (event)// @startlock
	{// @endlock
		WAF.sources.messdaten.delSelected( {
			onSuccess: function(event) {
				WAF.sources.messdaten.setEntityCollection(event.result);
			}
		}, $$('dg_messdaten').getSelectedRows());
	};// @lock

	b_1.click = function b_1_click (event)// @startlock
	{// @endlock
		//ausgewählten Sensor acktualisieren
		var sensor = $$("dg_Sensoren").column(1).getValueForInput();
		var ort = $$("dg_Sensoren").column(2).getValueForInput();
		var einheit = $$("dg_Sensoren").column(4).getValueForInput();
		var intervall = $$("dg_Sensoren").column(5).getValueForInput();
		var anzahl = $$("dg_Sensoren").column(6).getValueForInput();

		ds.Messdaten.holeMessdaten(sensor, einheit, ort, intervall, anzahl, {
		    onSuccess: function(event) {
		        alert(event.result);
		    },
		    onError: function(event) {
		        alert("Messdaten Aktualisierung fehlgeschlagen");
		    }
		});		
	};// @lock

	documentEvent.onLoad = function documentEvent_onLoad (event)// @startlock
	{// @endlock
		//sources.messdaten.query('ID = -1');
		//uncheck initial query in messdaten data source
		var jetzt = new Date();
		$$("Kalender1").setValue(jetzt.getDate().toString(), true);
		
		
//		if ($$("Kalender1").getSelectionMode() == 'single') {
//		    var beginnDatum = $$("Kalender1").getValue();
//		}
//		else {
//		    var beginnDatum = $$("Kalender1").getValue()[0];
//		}
//		var beginnDatum = new Date();
//		beginnDatum.setHours(0);
//		beginnDatum.setMinutes(0);
//		beginnDatum.setSeconds(0);
//		var endDatum = new Date();
//		endDatum.setHours(23);
//		endDatum.setMinutes(59);
//		endDatum.setSeconds(59);	
	
		//endDatum.setDate(endDatum.getDate() + 1);

		
		//$$("dg_Sensoren").setSelectedRows([1]); //Vorlauf Heizkörper - geht nur bei "multiple selection mode"

//		ds.Messdaten.sucheMessdaten('Reisen', '0', beginnDatum.toISOString(), endDatum.toISOString(), {
//		    onSuccess: function(event) {
//		        WAF.sources.messdaten.setEntityCollection(event.result);
//		        $$('l_chartHeader').setValue("T-Vorlauf Heizkörper in Reisen " + beginnDatum.toDateString());
//		    },
//		    onError: function(event) {
//		        alert("Fehler bei Messdatensuche");
//		    }
//		});
	};// @lock

	dg_Sensoren.onRowClick = function dg_Sensoren_onRowClick (event)// @startlock
	{// @endlock
		 var sensor = $$("dg_Sensoren").column(1).getValueForInput();
		 var ort = $$("dg_Sensoren").column(2).getValueForInput();
		 var beschreibung = $$("dg_Sensoren").column(3).getValueForInput();
		 var einheit = $$("dg_Sensoren").column(4).getValueForInput();
		 var intervall = $$("dg_Sensoren").column(5).getValueForInput();
		 var anzahl = $$("dg_Sensoren").column(6).getValueForInput();

		 if ($$("Kalender1").getSelectionMode() == 'single') {
		     var beginnDatum = $$("Kalender1").getValue();
		     var endDatum = new Date(beginnDatum);
		     endDatum.setDate(endDatum.getDate() + 1);

		 }
		 else { //Range
		    var beginnDatum = $$("Kalender1").getValue()[0];
			beginnDatum.setHours(0);
			beginnDatum.setMinutes(0);
			beginnDatum.setSeconds(0);
		    var endDatum = $$("Kalender1").getValue()[1];
		    endDatum.setHours(23);
			endDatum.setMinutes(59);
			endDatum.setSeconds(59);	
		 }
		//$$('l_chartHeader').setValue(beschreibung + " in " + ort + " " + beginnDatum.toDateString() + " - " + endDatum.toDateString());

		 //sources.messdaten.query('Ort == :1 AND Sensor_ID == :2 AND Datum_Uhrzeit >= :3 AND Datum_Uhrzeit < :4 Order by ID', ort, sensor, beginnDatum, endDatum);
		 ds.Messdaten.sucheMessdaten(ort, sensor, beginnDatum.toISOString(), endDatum.toISOString(), {
		     onSuccess: function(event) {
		         WAF.sources.messdaten.setEntityCollection(event.result);
		     },
		     onError: function(event) {
		         alert("Fehler bei Messdatensuche");
		     }
		 });

		
	};// @lock

	Kalender1.onChange = function Kalender1_onChange (event)// @startlock
	{// @endlock
		var sensor = $$("dg_Sensoren").column(1).getValueForInput();
		var ort = $$("dg_Sensoren").column(2).getValueForInput();
		var beschreibung = $$("dg_Sensoren").column(3).getValueForInput();

		if ($$("Kalender1").getSelectionMode() == 'single') {
		    var beginnDatum = $$("Kalender1").getValue();
		    var endDatum = new Date(beginnDatum);
		    endDatum.setDate(endDatum.getDate() + 1);
		}
		else { //Range
		    var beginnDatum = $$("Kalender1").getValue()[0];
			beginnDatum.setHours(0);
			beginnDatum.setMinutes(0);
			beginnDatum.setSeconds(0);
		    var endDatum = $$("Kalender1").getValue()[1];
		    endDatum.setHours(23);
			endDatum.setMinutes(59);
			endDatum.setSeconds(59);	
		}

	//	$$('l_chartHeader').setValue(beschreibung + " in " + ort + " " + beginnDatum.toDateString() + " - " + endDatum.toDateString());

		ds.Messdaten.sessionBeginDatum(beginnDatum.toISOString(), {
		    onSuccess: function(event) {
		        //sources.messdaten.query('Ort == :1 AND Sensor_ID == :2 AND Datum_Uhrzeit >= :3 AND Datum_Uhrzeit < :4 Order by ID' , ort, sensor, beginnDatum, endDatum);
		        ds.Messdaten.sucheMessdaten(ort, sensor, beginnDatum.toISOString(), endDatum.toISOString(), {
		            onSuccess: function(event) {
		                WAF.sources.messdaten.setEntityCollection(event.result);
		            },
		            onError: function(event) {
		                alert("Fehler bei Messdatensuche");
		            }
		        });
		    }
		});
	};// @lock

// @region eventManager// @startlock
	WAF.addListener("b_2", "click", b_2.click, "WAF");
	WAF.addListener("b_delSelection", "click", b_delSelection.click, "WAF");
	WAF.addListener("b_1", "click", b_1.click, "WAF");
	WAF.addListener("document", "onLoad", documentEvent.onLoad, "WAF");
	WAF.addListener("dg_Sensoren", "onRowClick", dg_Sensoren.onRowClick, "WAF");
	WAF.addListener("Kalender1", "onChange", Kalender1.onChange, "WAF");
// @endregion
};// @endlock
