
guidedModel =// @startlock
{
	Protokoll :
	{
		zeit :
		{
			onGet:function()
			{// @endlock
				return this.erstellt.toTimeString().substring(0,5);
			}// @startlock
		}
	},
	Messdaten :
	{
		collectionMethods :
		{// @endlock
			delSelected:function(gridAuswahl)
			{// @lock
				//http://forum.wakanda.org/showthread.php?1725-deleteing-selected-rows-with-a-class-ecollection-method&highlight=delete+selection
				//Verwendung von this beachten!
				var gridSet = this; //angezeigte Grid Messdaten
				var toDelete = ds.Messdaten.createEntityCollection(); //erst mal leer
				gridAuswahl.forEach(function(rowNum) {
					toDelete.add(gridSet[rowNum]); 
				});
				var neueAuswahl = this.minus(toDelete);
				toDelete.remove();
				return neueAuswahl;
			}// @startlock
		},
		methods :
		{// @endlock
			sucheMessdaten:function(ort, sensor, beginn, ende)
			{// @lock
				var MessOrt = ort;
				var MessSensor = sensor;
				var MessBeginn = beginn;
				var MessEnde = ende;
				var neueAuswahl = ds.Messdaten.query('Ort == :1 AND Sensor_ID == :2 AND Datum_Uhrzeit >= :3 AND Datum_Uhrzeit < :4 Order by ID', MessOrt, MessSensor, MessBeginn, MessEnde);
				return neueAuswahl;
			},// @lock
			sessionBeginDatum:function(beginnDatum)
			{// @lock
				currentSession().storage.chartBeginnDatum = beginnDatum; //Zeit = 0,0,0

			},
			sucheMessdaten:function(ort, sensor, beginn, ende)
			{
				var MessOrt = ort;
				var MessSensor = sensor;
				var MessBeginn = beginn;
				var MessEnde = ende;
				var neueAuswahl = ds.Messdaten.query('Ort == :1 AND Sensor_ID == :2 AND Datum_Uhrzeit >= :3 AND Datum_Uhrzeit < :4 Order by ID', MessOrt, MessSensor, MessBeginn, MessEnde);
				return neueAuswahl;
			},// @lock
			holeMessdaten:function(sensor, einheit, ort, intervall, anzahlWerte)
			{// @lock
				var datenWerdenGelesen = Mutex('datenWerdenGelesen');
				if (datenWerdenGelesen.tryToLock() == false) {
				    return "Semaphor blockiert Lesen des Sensors "+sensor+" ";
				}
				else {

				    //intervall in Sekunden, versuche httpGet zu vermeiden, wenn Daten aktuell - deshalb auch anzahlWerte
				    //anzahlWerte dient nur dazu ein Zeitfenster für die Suche des letzten Messergebnisses zu definieren
				    var jetzt = new Date();


				    //     //stelle sicher wir haben keine Datensäze in der Zukunft - Unglück 08.11.2012
				    //     var Messungen = ds.Messdaten.query('Datum_Uhrzeit > :1', jetzt);
				    //     if (Messungen.length > 0) {
				    //         Messungen.remove();
				    //     }
				    //für den letzten Messwert nehme den Zeitbeginn des aktuellen Intervalls in der Annahme, dass die Intervalle zur vollen Stunde beginnen
				    //also bei Intervall=12 Min, wenn es jetzt 15:22 ist, dann nehmen wir 15:12 u. gehen mit jedem Intervall rükwäts um 12 Min.
				    var MinSeitIntervall = jetzt.getMinutes() % (intervall / 60);
				    var MessEnde = new Date(jetzt - (MinSeitIntervall * 60000) - (jetzt.getSeconds() * 1000));
				    var MessBeginn = new Date(MessEnde - ((anzahlWerte - 1) * intervall * 1000));

				    //suche letzten Eintrag u. errechne dann, ab welchem Array element wir Daten schreiben müsen
				    var Minuten = intervall / 60;
				    var StartZeit = MessBeginn;
				    var MessOrt = ort;
				    var MessSensor = sensor;
  					var einstellung = ds.Einstellungen.all();

				    //nur mit dieser Syntax lassen sich vars einfüen - düfen auch nicht Funktionsparameter direkt sein!
				    var Messung = ds.Messdaten.find('Ort == :1 AND Sensor_ID == :2 AND Datum_Uhrzeit > :3 order by Datum_Uhrzeit desc', MessOrt, MessSensor, MessBeginn);
				    if (Messung != null) {
				        StartZeit = Messung.Datum_Uhrzeit;
				        StartZeit.setMinutes(StartZeit.getMinutes() + Minuten) //für nächsten Datensatz
				    }

				    if (StartZeit > jetzt) {
				        return "Sensor " + sensor + "-" + ort + ": Daten sind aktuell";
				    }
				    else {
				        if (ort === "Reisen") {
				            var urlAll4000 = einstellung.all4000_Reisen_url + "/sh?s=" + sensor;
				        }
				        else {
				            var urlAll4000 = einstellung.all4000_Eiche_url + "/sh?s=" + sensor;
				        }
				        //debugger;
				        var rq = new XMLHttpRequest();
				        rq.open('GET', urlAll4000, false); //synchron, asynchron wird noch nicht unterstüzt
				        rq.send();

						if (urlAll4000 === "") {
							return "kein Url-Eintrag für All4000";
						}
							else {
							    if (rq.readyState === 4) {
							        if (rq.status === 200) {

							            var dataArr = rq.responseText.split('A');

							            dataArr.shift(); //Sensor ID entfernen
							            while (isNaN(dataArr[0])) {
							                dataArr.shift(); //headers entfernen
							            }
							            dataArr.pop(); //ZMLOK am Ende entfernen
							            MessBeginn = new Date(MessEnde - ((dataArr.length - 1) * intervall * 1000));

							            var letzterWert = 0;
							            var gelesenerWert = 0;
							            var actSensor = ds.Sensoren.find('Ort == :1 AND Sensor_ID == :2', MessOrt, MessSensor);
							            if (actSensor != null) {
							                letzterWert = actSensor.letzterWert;
							            }
							            //schleife durch Array und speichere Daten ab StartZeit
							            //das Ende des Arrays liegt in der Vergangenheit
							            for (var i = dataArr.length - 1; i >= 0; i--) {
							                if (MessBeginn >= StartZeit) {
							                    var neueDaten = ds.Messdaten.createEntity();
							                    neueDaten.Datum_Uhrzeit = MessBeginn;
							                    neueDaten.Intervall = intervall;
							                    gelesenerWert = +dataArr[i];
							                    neueDaten.Messwert = +dataArr[i];
							                    neueDaten.Einheit = einheit;
							                    neueDaten.Sensor_ID = sensor;
							                    neueDaten.Ort = ort;
							                    neueDaten.save();
							                }
							                MessBeginn.setTime(MessBeginn.getTime() + Minuten * 60 * 1000); //+ Intervall in Minuten, setMinutes(), getMinutes() funktioniert nicht bei Sommer/Winter- Zeit Umschaltung
							            }
							            if ((actSensor != null) & (neueDaten != null)) {
							                actSensor.letzterWert = gelesenerWert;
							                actSensor.save();
							            }
							            datenWerdenGelesen.unlock();
							            return "Sensor " + sensor + "-" + ort + ": Daten eingelesen ok";
							        }
							        else {
							        	datenWerdenGelesen.unlock();
							        	return "Sensor " + sensor + "-" + ort + ": Http-Get Fehler";
							   		}
							    }
							    else {
							    	datenWerdenGelesen.unlock();
							    	return "Sensor " + sensor + "-" + ort + ": Http-timeout";
								}
							}
					}
					datenWerdenGelesen.unlock();
				}

			},// @lock
			fehlendeZeiten:function(sensor, ort, letzteZeit)
			{// @lock
				//gib Array der Fehlzeiten zurück
                var messSensor = sensor;
                var messOrt = ort;
                var lastTime = new Date(letzteZeit);

                var messungen = ds.Messdaten.query('Ort == :1 AND Sensor_ID == :2 AND Datum_Uhrzeit > :3 order by Datum_Uhrzeit asc', messOrt, messSensor, lastTime);
                  
                
                var count=messungen.length;
                var messZeitenArr = []; 
                var aufzeichungsBeginn = new Date(2012,10,1);
                var jetzt = new Date();

                if (count == 0) {
                   if (lastTime.getTime() == 0) {
                       messZeitenArr.push(aufzeichungsBeginn, jetzt);
                   }
                   else {
                       lastTime.setMinutes(lastTime.getMinutes() - 60);
                       var messWert = ds.Messdaten.find('Ort == :1 AND Sensor_ID == :2 AND Datum_Uhrzeit > :3 order by Datum_Uhrzeit desc', messOrt, messSensor, lastTime);
                       if (messWert != null) {
                           var messIntervall = messWert.Intervall / 60;
                           var lastTime = new Date(messWert.Datum_Uhrzeit);
                           lastTime.setMinutes(lastTime.getMinutes() + messIntervall); //nächste erwartete Messzeit
                           messZeitenArr.push(lastTime, jetzt);
                       }
                   }

               }
               else {
                   var messWert = messungen[0];
                   var messIntervall = messWert.Intervall / 60;
                   var messZeit = messWert.Datum_Uhrzeit;

                   if (lastTime.getTime() == 0) {
                       messZeitenArr.push(aufzeichungsBeginn, messZeit);

                   }
                   else {
                       if (lastTime < messWert.Datum_Uhrzeit) {
                           messZeitenArr.push(lastTime, messZeit);
                       }
                   }
                   var nextTime = new Date(messZeit);
                   nextTime.setMinutes(messZeit.getMinutes() + messIntervall); //nächste erwartete Messzeit
                   for (var i = 1; i < count; i++) {
                       messWert = messungen[i];
                       messZeit = new Date(messWert.Datum_Uhrzeit);
                       messIntervall = messWert.Intervall / 60;
                       if (messZeit.getTime() != nextTime.getTime()) {
                           if (messZeit.getTime() > nextTime.getTime()) {
                               messZeitenArr.push(nextTime, messZeit);
                           }
                       }
                       nextTime = new Date(messZeit);
                       nextTime.setMinutes(messZeit.getMinutes() + messIntervall); //nächste erwartete Messzeit
                   }
                   if (nextTime.getTime() < jetzt.getTime()) {
                       messZeitenArr.push(nextTime, jetzt);
                   }
               }               
               return messZeitenArr;
			}// @startlock
		},
		Stunden :
		{
			onGet:function()
			{// @endlock
				var d = new Date(this.Datum_Uhrzeit);
				var dBeg = new Date(currentSession().storage.chartBeginnDatum); //Zeit = 0,0,0
				var Std = d.getHours();
				var Min = d.getMinutes();
				var Tag = 0;		
				if (currentSession().storage.chartBeginnDatum != null) {
					d.setHours(0,0,0);
					Tag = Math.round((d-dBeg)/8.64e7);
				}
				return ((Std*10) + (Min/6) + (Tag*240));				
			}// @startlock
		},
		Zeit :
		{
			onGet:function()
			{// @endlock
				return this.Datum_Uhrzeit.toTimeString().substring(0,5); // Add your code here
			}// @startlock
		}
	}
};// @endlock
