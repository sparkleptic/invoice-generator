<template>

  <b-container fluid>
    <loading :show="show":label="label"></loading>
    <b-row style="margin-bottom:30px;margin-top:30px;">
      <b-col md="6" class="my-1"><img src="./assets/logo.png" width="180mm" /></b-col>
    </b-row>
    <b-row style="margin-bottom:30px;margin-top:30px;">
      <b-col md="2" class="my-1">
          <label class="col-sm-2 control-label" for="startDate">StartDate</label>
          <input type="date" class="form-control" id="startDate" v-model="startDate" placeholder="dddd-mm-dd" />
      </b-col>
      <b-col md="2" class="my-1">
          <label class="col-sm-2 control-label" for="endDate">EndDate</label>
          <input type="date" class="form-control" id="endDate" v-model="endDate" placeholder="dddd-mm-dd" />
      </b-col>
      <b-col md="2" class="my-1">
        <b-button size="sm" @click.stop="fetchByDate(startDate, endDate)" class="mr-1" style="margin-top:35px;">
          Search Record    
        </b-button>
      </b-col>
    </b-row>
    <b-row style="margin-bottom:30px;margin-top:30px;">
      <b-col md="3" class="my-1">
        <b-form-group horizontal label="Filter" class="mb-0">
          <b-input-group>
            <b-form-input v-model="filter" placeholder="Type to Search" />
            <b-input-group-button>
              <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
            </b-input-group-button>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col md="3" class="my-1">
        <b-form-group horizontal label="Sort" class="mb-0">
          <b-input-group>
            <b-form-select v-model="sortBy" :options="sortOptions">
              <option slot="first" :value="null">-- none --</option>
            </b-form-select>
            <b-input-group-button>
              <b-form-select :disabled="!sortBy" v-model="sortDesc">
                <option :value="false">Asc</option>
                <option :value="true">Desc</option>
              </b-form-select>
            </b-input-group-button>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col md="4" class="my-1">
        <b-form-group horizontal label="Per page" class="mb-0">
          <b-form-select :options="pageOptions" v-model="perPage" />
        </b-form-group>
      </b-col>
      <b-col md="2" class="my-1">
        <b-button size="sm" @click.stop="generateAllInvoice" class="mr-1">
          Generate All Record Invoice
        </b-button>
      </b-col>
    </b-row>

    <b-table responsive style="margin-bottom:20px;margin-top:20px;" show-empty
     stacked="md"
     :items="items"
     :fields="fields"
     :current-page="currentPage"
     :per-page="perPage"
     :filter="filter"
     :sort-by.sync="sortBy"
     :sort-desc.sync="sortDesc"
     @filtered="onFiltered"
    >
      <template slot="Rechnungsdatensatz" slot-scope="row">{{row.value}}</template>
      <template slot="Vertragsnummer" slot-scope="row">{{row.value}}</template>
      <template slot="Rechnungsnummer" slot-scope="row">{{row.value}}</template>
      <template slot="Rechnungsdatum" slot-scope="row">{{row.value}}</template>
      <template slot="Kundenname" slot-scope="row">{{row.value}}</template>
      <template slot="KD_E-Mail" slot-scope="row">{{row.value}}</template>
      <template slot="Ansprechpartner" slot-scope="row">{{row.value}}</template>
      
      <template slot="actions" slot-scope="row">          
        <b-button size="sm" @click.stop="fetchByContractNum(row.item, row.index, $event.target)" class="mr-1">
          View Invoice
        </b-button>
      </template>

      <template slot="editactions" slot-scope="row">          
        <b-button size="sm" @click.stop="editByContractNum(row.item, row.index, $event.target)" class="mr-1">
          Edit Invoice
        </b-button>
      </template>

      <template slot="invoiceactions" slot-scope="row">          
        <b-button size="sm" @click.stop="generateInvoice(row.item, $event.target)" class="mr-1">
          Generate Invoice
        </b-button>
      </template>

    </b-table>
    <b-row style="margin-bottom:20px;margin-top:35px;">
      <div style="text-align:center;margin: 0 auto;">
        <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
      </div>
    </b-row>
    <b-modal id="modalInfo" @hide="resetModal" size="lg" :title="modalInfo.title" ok-only>
        <div v-if="modalInfo.content">
            <div class="utility-bill-container" style="background-color: #fff; margin: auto;">
              <div class="utility-bill-content clearfix" style="background-color: #fff;margin-top: 50px;">
                
                <div class="energicos-logo" style="text-align: right;">
                  <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
                </div>
                
                <div class="key-location" style="text-align: left; font-family: 'energicos-regular'; color: #4a4a4a; font-size: 10px; letter-spacing: 1.3px; margin-bottom: 15px; ">
                  Energicos Norddeutschland GmbH |  Franklinstrasse 9-11 | 10587 Berlin
                </div>

                <div class="key-area" style=" text-align: left; color: #666666; line-height: 16px; letter-spacing: 0.75px; font-family: 'energicos-regular'; font-size: 13px;">
                  {{modalInfo.content[0].Kundenname}}<br/>
                  {{modalInfo.content[0].KD_Strasse}},<br/>
                  {{modalInfo.content[0].KD_PLZ_Ort}}
                </div>

                <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 15px;">
                  <div class="address-top-wrap" style="float: right;">
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;margin-top: -10px;" /> Datum :</span>  {{ modalInfo.content[0].Rechnungsdatum }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 7px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:-2px; margin-bottom:-4px;margin-top: -5px;" /> Ansprechpartner :</span> {{ modalInfo.content[0].Ansprechpartner }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px; margin-top: -10px;" /> Telefon :</span> <span>030/ 520098-122</span>
                  </div>
                </div>

                <div class="energicos_key_components clearfix" >
                  <div class="component" style=" width: 19%; float: left;">
                    <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/vertragsnummer-icon.png" style="margin-bottom: 5px;" /><br/>
                      Vertragsnummer
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Vertragsnummer }}</li>
                    </ul>
                  </div>

                  <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                    <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/objektnummer-icon.png" style="margin-bottom: 5px;" /><br/>
                      Objektnummer
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Objektnummer }}</li>
                    </ul>

                  </div>

                  <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                    <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/rechungsnummer-icon.png" style="margin-bottom: 5px;" /><br/>
                      Rechnungsnummer
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Rechnungsnummer }}</li>
                    </ul>
                  </div>

                  <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                    <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/abrechungszeitraum-icon.png" style="margin-bottom: 5px;" /><br/>
                      Abrechnungszeitraum
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0]['Rechnung bis'] }} - {{ modalInfo.content[0]['Rechnung von'] }}</li>
                    </ul>
                  </div>

                  <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                    <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/zehibetrag_brutto-icon.png" style="margin-bottom: 5px;" /><br/>
                      Zahibetrag brutto
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">1.5454.70 EUR</li>
                    </ul>
                  </div>
                </div>

                <div class="energicos-letter" style="color: #4a4a4a; font-size: 12px; font-family: energicos-regular; color: #4a4a4a;  text-align: left; padding-bottom:20px;">
                  <p class="salutation" style=" margin-bottom: 5px;" >Sehr geehrter Herr Mustermann,</p>
                  <p style="margin-bottom: 5px;">für den zurückliegenden Zeitraum berechnen wir Ihnen die im folgenden aufgeführten Entgelte. Die Abrechnungsgrundlagen können Sie der beigefügten Aufstellung auf Seite 2 entnehmen.</p>
                </div>

                <div class="energicos_components_cluster clearfix">
                  <div class="cluster" style=" width: 20.4%; float:left;">
                    <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Position</div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Position_Grundkosten }}</li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Position_Verbrauchskosten }}</li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Position_Vorauszahlungen }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Position_Geb\u00fchren }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{modalInfo.content[0].Position_Gutschriften }}</li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Position_Rabatt }}</li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Position_Zahlbetrag}}  </span></li>
                    </ul>
                  </div>
                  <div class="cluster" style=" width: 16.5%; float:left; margin-left:.3%;">
                    <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">ERLAUTERUNG</div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> Verbrauchskosten</li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> Verbrauchskosten</li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="blank" style="color: #fff;">blank</span></li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="blank"  style="color: #fff;">blank</span></li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="blank" style="color: #fff;">blank</span></li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="blank" style="color: #fff;">blank</span></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Zahlberag</span></li>
                    </ul>
                  </div>
                  <div class="cluster" style=" width: 15.4%; float:left; margin-left:.3%;">
                    <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Betrag Netto</div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Betrag_netto_Grundkosten }}</li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_netto_Verbrauchskosten }}</li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_netto_Vorauszahlungen }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_netto_Geb\u00fchren }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_netto_Gutschriften }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_netto_Rabatt }} </li>
                      <li class="item last"  style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Betrag_netto_Zahlbetrag }} </span></li>
                    </ul>
                  </div>
                  <div class="cluster" style=" width: 15.4%; float:left; margin-left:.3%;">
                    <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Umsatzsteuer</div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umsatzsteuer_Grundkosten }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umsatzsteuer_Verbrauchskosten }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umsatzsteuer_Vorauszahlungen }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umsatzsteuer_Geb\u00fchren }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umsatzsteuer_Gutschriften }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umsatzsteuer_Rabatt }} </li>
                      <li class="item last"  style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Umsatzsteuer_Zahlbetrag }} </span></li>
                    </ul>
                  </div>
                  <div class="cluster" style=" width: 14.4%; float:left; margin-left:.3%;">
                    <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Steuersatz</div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Steuersatz_Grundkosten }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Steuersatz_Verbrauchskosten }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Steuersatz_Vorauszahlungen }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Steuersatz_Geb\u00fchren }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Steuersatz_Gutschriften }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Steuersatz_Rabatt }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);">
                      <span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Steuersatz_Zahlbetrag }} </span></li>
                    </ul>
                  </div>
                  <div class="cluster" style=" width: 16.4%; float:left; margin-left:.3%;">
                    <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Betrag brutto</div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_brutto_Grundkosten }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_brutto_Verbrauchskosten }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_brutto_Vorauszahlungen }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_brutto_Geb\u00fchren }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_brutto_Gutschriften }} </li>
                      <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Betrag_brutto_Rabatt }} </li>
                      <li class="item last"style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Betrag_brutto_Zahlbetrag }} </span></li>
                    </ul>
                  </div>
                </div>
                <div class="energicos-letter" style="color: #4a4a4a; font-size: 12px; font-family: energicos-regular; color: #4a4a4a;  text-align: left; margin-bottom: 15px;">
                  <p style="margin-bottom: 5.4px;">Wenn Sie uns ein SEPA Mandat erteilt haben, werden wir den Restbetrag von Ihrem Konto innerhalb von 14 Tagen mit der Gläubiger ID DE123356066666655 unter der Referenz {Rechnungsnummer} einziehen. Guthaben werden von uns in diesem Zeitraum auf das uns benannte Konto überwiesen.</p>
                  <p style="margin-bottom: 5.4px;">Haben Sie uns bisher keine Einzugsermächtigung erteilt, bitten wir Sie den Rechnungsbetrag innerhalb von 14 Tagen nach Rechnungserhalt zu überweisen.</p>
                  <p style="margin-bottom: 5.4px;">Für die folgende Abrechnungsperiode 2018 ergibt sich ein montlicher Abschlagsbetrag (inklusive Mehrwertsteuer) von {85,00} EUR ab dem 01.01.2018.</p>
                  <p style="margin-bottom: 5.4px;">Wir weisen darauf hin, daß gemäß Energieversorgungsvertrag die Zustimmung zu der vorliegenden Abrechnung als erteilt gilt, falls dieser Abrechnung nicht innerhalb einer Frist von vier Wochen ab Rechnungszugang wiedersprochen wird.</p>
                </div>
                <div class="footer-energicos clearfix">
                  <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
                  <div class="footer-component" style=" width: 19%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    energicos energy Gmbh<br/>
                    Franklinstrasse 9-11<br/>
                    10587 Berlin
                  </div>
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Sitz der Gesellschaft:<br/>
                    Berlin Amtsgericht<br/>
                    Charlottenburg<br/>
                    HRB 180072 B USt-IdNr.:<br/>
                    DE813522350
                  </div>
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Geschäftsführung<br/>
                    Dipl.BW (FH) Angelika<br/>
                    Hanke<br/>
                  </div>
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00
                  </div>
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00<br/>
                    BIC: HYBNAAHRA
                  </div>
                </div>
                <div class="energicos-wave" >
                  <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
                </div>
              </div>
            </div>            
            <div class="utility-bill-container" style="background-color: #fff;margin: auto;">
              <div class="utility-bill-content"  style="background-color: #fff; margin-top: 50px;">
                <div class="energicos-logo" style="text-align: right;">
                  <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
                </div>                
                <div class="key-area" style=" color: #666666; margin-top:10px;">
                  <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 12px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Kundenname :</span> {{modalInfo.content[0].Kundenname}}<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Kundenanschrift :</span> Musterstrasse 25, XXXX Ort<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Vertragsnummer :</span> {{modalInfo.content[0].Vertragsnummer}}<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Kunden-email :</span> {{modalInfo.content[0]['KD_E-Mail']}} </p>
                  
                  <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 0px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Objektnummer :</span> {{ modalInfo.content[0].Objektnummer }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold';">Lieferadresse :</span> {{modalInfo.content[0].Lieferadresse}}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold';">Rechungsnummer :</span> {{modalInfo.content[0].Rechnungsnummer}}
                  </p>
                  <p class="current-page" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 8px; letter-spacing: 1px;">Seite 2 von 4</p>
                  
                </div>
                <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 18px; letter-spacing: 0.75px; margin-bottom: 15px;">
                  <div class="address-top-wrap" style="float: right;">
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;margin-top: -10px;" /> Datum :</span>  {{ modalInfo.content[0].Rechnungsdatum }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 7px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:-2px; margin-bottom:-4px;margin-top: -5px;" /> Ansprechpartner :</span> {{ modalInfo.content[0].Ansprechpartner }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px; margin-top: -10px;" /> Telefon :</span> <span>030/ 520098-122</span>
                  </div>
                </div>
                <div class="energicos-content">
                  <h5 class="main-title" style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;">Verbrauchsermittlung und Rechungspositionen Heizwärme</h5>
                  <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbräuche im Abrechnungszeitraum</h6>
                </div>
                
                <div class="energicos_key_components_6cols clearfix">
                  <div class="component" style=" width: 14%; float:left;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zähler<br/> 
                      Nummer
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB1_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB1_p2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB1_p3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB1_p4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Z\u00e4hlernummer_MB1_p5 }}</span></li>
                    </ul>
                  </div>
                  <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zeitraum
                      <div class="sub-columns clearfix">
                        <div class="side-1" style=" width: 50%; float:left;">von</div>
                        <div class="side-2" style=" width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_p4 }}</li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">{{ modalInfo.content[0].Zeitraum_von_MB1_p5 }}</span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_p4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> {{ modalInfo.content[0].Zeitraum_bis_MB1_p5 }} </span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zählerstand
                      <div class="sub-columns clearfix">
                        <div class="side-1" style=" width: 50%; float:left;">von</div>
                        <div class="side-2" style=" width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB1_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB1_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB1_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB1_p4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB1_p5 }} </span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB1_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB1_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB1_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB1_p4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB1_p5 }} </span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauch<br/>
                      in kWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px; "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p5 }} </span></li>
                    </ul>
                  </div>
                  <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Umrechung<br/>
                      Faktor
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB1_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB1_p2 }}</li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB1_p2 }}</li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB1_p4 }}</li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">{{ modalInfo.content[0].Verbrauch_in_MWh_MB1_p5 }}</span></li>
                    </ul>
                  </div>
                  <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauch<br/>
                      in MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_p2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_p3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_p4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total"  style="font-family: energicos-bold ; font-size: 11px; ">{{ modalInfo.content[0].Verbrauch_in_MWh_MB1_p5 }}</span></li>
                    </ul>
                  </div>
                </div>
                <div class="energicos-content">
                  <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbrauchspreise im Abrechnungszeitraum</h6>
                </div>                
                <div class="energicos_key_components_5cols clearfix">
                  <div class="component" style="width: 22%; float:left;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zeitraum
                      <div class="sub-columns clearfix">
                        <div class="side-1" style="width: 50%; float:left;">von</div>
                        <div class="side-2" style="width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1 " style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_ap1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_ap2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_ap3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_ap4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> Total </span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_ap1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_ap2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_ap3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_ap4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> Blank </span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchsmenge<br/> 
                      in MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> 5.752</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Abrechnungspreis<br/>
                      in EUR / MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauchspreis_MB1_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauchspreis_MB1_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauchspreis_MB1_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].Verbrauchspreis_MB1_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">  {{ modalInfo.content[0].Total_Verbrauchspreis_MB1 }} </span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Preisänderungs<br/>
                      Faktor
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">  {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank  </span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchskosten<br/>
                      netto in EUR
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Verbrauchskosten_MB1_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Verbrauchskosten_MB1_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Verbrauchskosten_MB1_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">{{ modalInfo.content[0].Verbrauchskosten_MB1_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Total_Verbrauchskosten_MB1 }} </span></li>
                    </ul>
                  </div>
                </div>
                <div class="energicos-content">
                  <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Grundpreise im Abrechnungszeitraum</h6>
                </div>                
                <div class="energicos_key_components_5cols clearfix">
                  <div class="component" style="width: 22%; float:left;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zeitraum
                      <div class="sub-columns clearfix">
                        <div class="side-1" style="width: 50%; float:left;">von</div>
                        <div class="side-2" style="width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1 " style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_gp1}} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_gp2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_gp3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB1_gp4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">Total</span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_gp1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_gp2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_gp3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB1_gp4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Blank</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchsmenge<br/> 
                      in MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB1_gp1}} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB1_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB1_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB1_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Abrechnungspreis<br/>
                      in EUR / kw * a
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB1_gp1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB1_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB1_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB1_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Total_Grundpreis_MB1 }} </span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Preisänderungs<br/>
                      Faktor
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_gp1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB1_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchskosten<br/>
                      netto in EUR
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB1_gp1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB1_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB1_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB1_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Total_Grundkosten_MB1 }} </span></li>
                    </ul>
                  </div>
                </div>
                <div class="footer-energicos clearfix">
                  <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
                  <div class="footer-component" style=" width: 19%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    energicos energy Gmbh<br/>
                    Franklinstrasse 9-11<br/>
                    10587 Berlin
                  </div>                  
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Sitz der Gesellschaft:<br/>
                    Berlin Amtsgericht<br/>
                    Charlottenburg<br/>
                    HRB 180072 B USt-IdNr.:<br/>
                    DE813522350
                  </div>
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Geschäftsführung<br/>
                    Dipl.BW (FH) Angelika<br/>
                    Hanke<br/>
                  </div>                  
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00
                  </div>                  
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00<br/>
                    BIC: HYBNAAHRA
                  </div>
                </div>
                <div class="energicos-wave" >
                  <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
                </div>                
              </div>
            </div>
            <div class="utility-bill-container" style="background-color: #fff; margin: auto;">
              <div class="utility-bill-content"  style="background-color: #fff;margin-top: 50px;">
                <div class="energicos-logo" style="text-align: right;">
                  <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
                </div>
                
                <div class="key-area" style=" color: #666666; margin-top:10px;">
                  <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 12px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Kundenname :</span> {{modalInfo.content[0].Kundenname}}<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Kundenanschrift :</span> Musterstrasse 25, XXXX Ort<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Vertragsnummer :</span> {{modalInfo.content[0].Vertragsnummer}}<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Kunden-email :</span>  {{modalInfo.content[0]['KD_E-Mail']}} </p>
                  
                  <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 0px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Objektnummer :</span> {{ modalInfo.content[0].Objektnummer }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold';">Lieferadresse :</span> {{modalInfo.content[0].Lieferadresse}}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold';">Rechungsnummer :</span> {{modalInfo.content[0].Rechnungsnummer}}
                  </p>
                  <p class="current-page" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 8px; letter-spacing: 1px;">Seite 2 von 4</p>
                  
                </div>
                <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 18px; letter-spacing: 0.75px; margin-bottom: 15px;">
                  <div class="address-top-wrap" style="float: right;">
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 3px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;" />Datum :</span>  {{ modalInfo.content[0].Rechnungsdatum }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 3px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:5px; margin-bottom:-4px;" />Ansprechpartner :</span> {{ modalInfo.content[0].Ansprechpartner }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 3px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px;" />Telefon :</span> <span>030/ 520098-122</span>
                  </div>
                </div>
                <div class="energicos-content">
                  <h5 class="main-title" style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;">Verbrauchsermittlung und Rechungspositionen Warmwasser</h5>
                  <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbräuche Warmwasser im Abrechnungszeitraum</h6>
                </div>
                
                <div class="energicos_key_components_6cols clearfix">
                  <div class="component" style=" width: 14%; float:left;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zähler<br/> 
                      Nummer
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB2_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB2_p2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB2_p3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlernummer_MB2_p4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">{{ modalInfo.content[0].Z\u00e4hlernummer_MB2_p5 }}</span></li>
                    </ul>
                  </div>
                  <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zeitraum
                      <div class="sub-columns clearfix">
                        <div class="side-1" style=" width: 50%; float:left;">von</div>
                        <div class="side-2" style=" width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_p4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> {{ modalInfo.content[0].Zeitraum_von_MB2_p5 }} </span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_p4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> {{ modalInfo.content[0].Zeitraum_bis_MB2_p5 }} </span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zählerstand
                      <div class="sub-columns clearfix">
                        <div class="side-1" style=" width: 50%; float:left;">von</div>
                        <div class="side-2" style=" width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB2_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB2_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB2_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB2_p4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color: #fff"> {{ modalInfo.content[0].Z\u00e4hlerstand_von_MB2_p5 }}</span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB2_p1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB2_p2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB2_p3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB2_p4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color#fff;">  {{ modalInfo.content[0].Z\u00e4hlerstand_bis_MB2_p5 }}  </span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauch<br/>
                      in kWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB2_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB2_p2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB2_p3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB2_p4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px; "> {{ modalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB2_p5 }}</span></li>
                    </ul>
                  </div>
                  <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Umrechung<br/>
                      Faktor
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB2_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB2_p2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB2_p3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Umrechnungsfaktor_MB2_p4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> {{ modalInfo.content[0].Umrechnungsfaktor_MB2_p5 }} </span></li>
                    </ul>
                  </div>
                  <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauch<br/>
                      in MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB2_p1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB2_p2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB2_p3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB2_p4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total"  style="font-family: energicos-bold ; font-size: 11px; ">  {{ modalInfo.content[0].Verbrauch_in_MWh_MB2_p5 }} </span></li>
                    </ul>
                  </div>
                </div>
                <div class="energicos-content">
                  <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbrauchskosten Warmwasser im Abrechnungszeitraum</h6>
                </div>                
                <div class="energicos_key_components_5cols clearfix">
                  <div class="component" style="width: 22%; float:left;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zeitraum
                      <div class="sub-columns clearfix">
                        <div class="side-1" style="width: 50%; float:left;">von</div>
                        <div class="side-2" style="width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1 " style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style="list-style: none; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_ap1 }} </li>
                          <li class="item" style="list-style: none; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_ap2 }} </li>
                          <li class="item" style="list-style: none; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_ap3 }} </li>
                          <li class="item" style="list-style: none; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_ap4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">Total</span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_ap1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_ap2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_ap3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_ap4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Blank</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchsmenge<br/> 
                      in MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi2os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi4os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_ap3erbrauch_in_MWh_MB2_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Abrechnungspreis<br/>
                      in EUR / MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauch_in_MWh_MB1_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Total_Verbrauchspreis_MB1 }} </span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Preisänderungs<br/>
                      Fakto1
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi2os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi4os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchskosten<br/>
                      netto in EUR
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauchskosten_MB2_ap1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauchskosten_MB2_ap2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauchskosten_MB2_ap3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Verbrauchskosten_MB2_ap4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> {{ modalInfo.content[0].Total_Verbrauchskosten_MB2 }} </span></li>
                    </ul>
                  </div>
                </div>
                <div class="energicos-content">
                  <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Grundkosten Warmwasser im Abrechnungszeitraum</h6>
                </div>                
                <div class="energicos_key_components_5cols clearfix">
                  <div class="component" style="width: 22%; float:left;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Zeitraum
                      <div class="sub-columns clearfix">
                        <div class="side-1" style="width: 50%; float:left;">von</div>
                        <div class="side-2" style="width: 50%; float:left;">bis</div>
                      </div>
                    </div>
                    <div class="sub-columns clearfix">
                      <div class="side-1 " style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_gp1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_gp2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_gp3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_von_MB2_gp4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">Total</span></li>
                        </ul>
                      </div>
                      <div class="side-2" style="width: 50%; float:left;">
                        <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_gp1 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_gp2 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_gp3 }} </li>
                          <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Zeitraum_bis_MB2_gp4 }} </li>
                          <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Blank</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchsmenge<br/> 
                      in MWh
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB2_gp1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB2_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB2_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Leistung_MB2_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Abrechnungspreis<br/>
                      in EUR / kw * a
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB2_gp1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB2_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB2_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundpreis_MB2_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">{{ modalInfo.content[0].Total_Grundpreis_MB2 }}</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Preisänderungs<br/>
                      Faktor
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_gp1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].\u00c4nderungsfaktor_MB2_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                    </ul>
                  </div>
                  <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Verbrauchskosten<br/>
                      netto in EUR
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB2_gp1 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB2_gp2 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB2_gp3 }} </li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> {{ modalInfo.content[0].Grundkosten_MB2_gp4 }} </li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">  {{ modalInfo.content[0].Total_Grundkosten_MB2 }} </span></li>
                    </ul>
                  </div>
                </div>
                <div class="footer-energicos clearfix">
                  <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
                  <div class="footer-component" style=" width: 18.5%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    energicos energy Gmbh<br/>
                    Franklinstrasse 9-11<br/>
                    10587 Berlin
                  </div>                  
                  <div class="footer-component" style=" width: 18.5%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Sitz der Gesellschaft:<br/>
                    Berlin Amtsgericht<br/>
                    Charlottenburg<br/>
                    HRB 180072 B USt-IdNr.:<br/>
                    DE813522350
                  </div>
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Geschäftsführung<br/>
                    Dipl.BW (FH) Angelika<br/>
                    Hanke<br/>
                  </div>                  
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00
                  </div>                  
                  <div class="footer-component" style=" width: 22%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00<br/>
                    BIC: HYBNAAHRA
                  </div>
                </div>
                <div class="energicos-wave" >
                  <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
                </div>                
              </div>
            </div>
            <div class="utility-bill-container" style="background-color: #fff; margin: auto;">
              <div class="utility-bill-content"   style="background-color: #fff; margin-top: 50px;">
                <div class="energicos-logo" style="text-align: right;">
                  <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
                </div>
                
                <div class="key-area" style=" color: #666666; margin-top:10px;">
                  <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 12px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Kundenname :</span> {{modalInfo.content[0].Kundenname}}<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Kundenanschrift :</span> Musterstrasse 25, XXXX Ort<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Vertragsnummer :</span>  {{modalInfo.content[0].Vertragsnummer}}<br/>
                  <span class="energicos-important" style="font-family: 'energicos-bold';">Kunden-email :</span>   {{modalInfo.content[0]['KD_E-Mail']}} </p>
                  
                  <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 0px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Objektnummer :</span> {{ modalInfo.content[0].Objektnummer }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold';">Lieferadresse :</span> {{modalInfo.content[0].Lieferadresse}}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold';">Rechungsnummer :</span> {{modalInfo.content[0].Rechnungsnummer}}
                  </p>
                  <p class="current-page" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 8px; letter-spacing: 1px;">Seite 2 von 4</p>
                  
                </div>
                <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 18px; letter-spacing: 0.75px; margin-bottom: 15px;">
                  <div class="address-top-wrap" style="float: right;">
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;margin-top: -10px;" /> Datum :</span>  {{ modalInfo.content[0].Rechnungsdatum }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 7px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:-2px; margin-bottom:-4px;margin-top: -5px;" /> Ansprechpartner :</span> {{ modalInfo.content[0].Ansprechpartner }}<br/>
                    <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px; margin-top: -10px;" /> Telefon :</span> <span>030/ 520098-122</span>
                  </div>
                </div>
                <div class="energicos-content" >
                  <h5 class="main-title" style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px; margin-top: 0px;">Referenzwerte</h5>
                </div>

                <div class="energicos_key_components_4cols clearfix">
                  <div class="component component-header-blank" style="width: 33%; float: left; margin-top: 32px;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px;">
                      <li class="item-left"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242);"> {{ modalInfo.content[0].Verbrauch }}</li>
                      <li class="item-left"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242);">{{ modalInfo.content[0].Energieentgelte }}    </li>
                      <li class="item-left"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242);"> {{modalInfo.content[0]['Gaspreis Mittel Jahr'] }} </li>
                      <li class="item-left last" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); border-bottom: 0.1mm solid #e1e0e5;"> {{ modalInfo.content[0]['Verbrauch je m\u00b2']  }} </li>
                    </ul>
                  </div>
                  <div class="component" style="width: 27%; float: left; margin-left:0.3%;">
                    <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Abrechnungsperiode
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px;">
                      <li class="item" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;"> 35,567 MWh</li>
                      <li class="item" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">3,470.56 EUR</li>
                      <li class="item" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">44.50 EUR/MWh</li>
                      <li class="item last" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); border-bottom: 0.1mm solid #e1e0e5; text-align: center;">105 kWh/m2</li>
                    </ul>
                  </div>
                  <div class="component" style="width: 27%; float: left; margin-left:0.3%;">
                    <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                      Vorperiode
                    </div>
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; text-align: center;">
                      <li class="item"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">35,567 MWh</li>
                      <li class="item"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">3,470.56 EUR</li>
                      <li class="item"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">44.50 EUR/MWh</li>
                      <li class="item last"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); border-bottom: 0.1mm solid #e1e0e5; text-align: center;">105 kWh/m2</li>
                    </ul>
                  </div>
                </div>
                <div class="energicos-content">
                  <div class="energicos-red"  style="background-color: rgb(195, 0, 23); height: 0.7px; margin-top: 11px; margin-bottom: 11px;"></div>
                  <h5 class="main-title"  style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;  margin-top: 0px;">Aufteilung Wärme/ Warmwasser</h5>
                </div>

                <div class="energicos_key_components_2cols clearfix"  style="font-size: 11px; font-family: 'energicos-regular'; color: #4a4a4a; line-height: 17px;">
                  <div class="side-1-energicos" style=" width:26.5%;  float: left;">
                    <img src="./assets/img/pie-chart.svg" width="180px" alt="graphics-key"/>
                  </div>

                  <div class="side-2-energicos" style=" width: 68.5%; margin-left:2%; float: left;">
                    <p class="Aufteilung-spacer" style="margin-top:30px;">Die Heizkostenverordnung sieht vor, die Kosten für Wärme für Heizzwecke und Warmwasseraufbereitung aufzuteilen. Dazu müssen seit 2013 separate Warmwasserzähler installiert sein. Der Warmwasseranteil sollte nicht höher als 18% der Gesamtwärmekosten liegen. Insbesondere ein Abgleich der Warmwasser-Zirkulationssystems kann hierbei zu erheblichen Einsparungen führen. Wir setzen das gern mit Ihnen zusammen um, sprechen Sie uns bitte an!</p>
                  </div>
                </div>

                <div class="energicos-content">
                  <div class="energicos-red" style="background-color: rgb(195, 0, 23); height: 0.7px; margin-top: 11px; margin-bottom: 11px;"></div>
                  <h5 class="main-title"  style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;  margin-top: 0px;">Betriebskostenoptimierung</h5>
                </div>

                <div class="energicos_key_components_2cols clearfix" style="font-size: 11px; font-family: 'energicos-regular'; color: #4a4a4a; line-height: 17px;">
                  <div class="side-1-energicos" style="width:  48%; float: left;">
                    <p style="margin-top: 0px; margin-bottom:5px;">Mit der Darstellung der Gebäude Energieeffizienzklassen soll, ähnlich wie bereits bei Haushaltsgeräten üblich, Kauf- oder Mietinteressenten eine schnelle Einordnung des energetischen Zustands des Gebäudes ermöglicht werden.Im Sinne einer maximalen Betriebskostenoptimierung sollten Mieter, Gebäudebesitzer und Energielieferant in dieser Hinsicht an einem Strang ziehen um den Verbrauch des Gebäudes je m2 zu minimieren. Wenn Sie daran interessiert sind, rufen Sie uns bitte an!</p>
                  </div>

                  <div class="side-2-energicos" style=" width: 48%; float: left; margin-left: 2%; ">
                    <img src="./assets/img/graphic-key.png" width="360px" alt="graphics-key"/>
                    </div>
                </div>

                <div class="footer-energicos clearfix">
                  <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
                  <div class="footer-component" style=" width: 18.5%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    energicos energy Gmbh<br/>
                    Franklinstrasse 9-11<br/>
                    10587 Berlin
                  </div>
                  
                  <div class="footer-component" style=" width: 18.5%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Sitz der Gesellschaft:<br/>
                    Berlin Amtsgericht<br/>
                    Charlottenburg<br/>
                    HRB 180072 B USt-IdNr.:<br/>
                    DE813522350
                  </div>
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Geschäftsführung<br/>
                    Dipl.BW (FH) Angelika<br/>
                    Hanke<br/>
                  </div>
                  
                  <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00
                  </div>

                  
                  <div class="footer-component" style=" width: 22%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                    Hypovereinsbank<br/>
                    Konto: 2245343<br/>
                    IBAN: DE23235434846446554<br/>
                    BLZ: 100 500 00<br/>
                    BIC: HYBNAAHRA
                  </div>
                </div>

                <div class="energicos-wave" >
                  <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
                </div>
              </div>
            </div>
        </div>
    </b-modal>

    <b-modal id="EditmodalInfo" @hide="resetModal" size="lg" :title="EditmodalInfo.title" ok-only>
      <div v-if="EditmodalInfo.content">
        <div class="utility-bill-container" style="background-color: #fff; margin: auto;">
          <div class="utility-bill-content clearfix" style="background-color: #fff; margin-top: 50px;">
            <div class="energicos-logo" style="text-align: right;">
              <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
            </div>
            <div class="key-location" style="text-align: left; font-family: 'energicos-regular'; color: #4a4a4a; font-size: 10px; letter-spacing: 1.3px; margin-bottom: 15px; ">
              Energicos Norddeutschland GmbH |  Franklinstrasse 9-11 | 10587 Berlin
            </div>
            <div class="key-area" style=" text-align: left; color: #666666; line-height: 16px; letter-spacing: 0.75px; font-family: 'energicos-regular'; font-size: 13px;">
              <address>
                <input type="text" name="Kundenname" placeholder="Kundenname" v-model="EditmodalInfo.content[0].Kundenname"/><br/>
                <input type="text" name="KD_Strasse" placeholder="Strasse PLZ," v-model="EditmodalInfo.content[0].KD_Strasse"/><br/>
                <input type="text" name="KD_PLZ_Ort" placeholder="Ort" v-model="EditmodalInfo.content[0].KD_PLZ_Ort"/>
              </address>
            </div>
            <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 15px;">
              <div class="address-top-wrap" style="float: right;">
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;margin-top: -10px;" /> Datum :</span>  <input type="date" value="31.01.2018" name="Rechnungsdatum" v-model="EditmodalInfo.content[0].Rechnungsdatum"/><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 7px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:-2px; margin-bottom:-4px;margin-top: -5px;" /> Ansprechpartner :</span> <input type="text" value="Birgit Meißner" name="Ansprechpartner" placeholder="Birgit Meißner" v-model="EditmodalInfo.content[0].Ansprechpartner"/><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px; margin-top: -10px;" /> Telefon :</span> <span>030/ 520098-122</span>
              </div>
            </div>
            <div class="energicos_key_components clearfix" >
              <div class="component" style=" width: 19%; float: left;">
                <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/vertragsnummer-icon.png" style="margin-bottom: 5px;" /><br/>
                  Vertragsnummer
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="ENB - 002824" name="Vertragsnummer" v-model="EditmodalInfo.content[0].Vertragsnummer" /></li>
                </ul>
              </div>

              <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/objektnummer-icon.png" style="margin-bottom: 5px;" /><br/>
                  Objektnummer
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="121345-12" value="121345-12" name="Objektnummer" v-model="EditmodalInfo.content[0].Objektnummer" /></li>
                </ul>

              </div>

              <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/rechungsnummer-icon.png" style="margin-bottom: 5px;" /><br/>
                  Rechungsnummer
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1017W-1215" value="1017W-1215" name="Rechnungsnummer" v-model="EditmodalInfo.content[0].Rechnungsnummer" /></li>
                </ul>
              </div>

              <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/abrechungszeitraum-icon.png" style="margin-bottom: 5px;" /><br/>
                  Abrechnungszeitraum
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" name="Rechnung_bis" v-model="EditmodalInfo.content[0].Rechnung_bis" /> - <input type="text" name="Rechnung_von" v-model="EditmodalInfo.content[0].Rechnung_von" /></li>
                </ul>
              </div>

              <div class="component" style=" width: 19.5%; float: left; margin-left: 0.75%;">
                <div class="component-header" style="background-color: #f5f5f5; width: 100%; padding-top: 25px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.1mm #c30017; margin-bottom: 0.75px; font-family: 'energicos-semibold'; font-size: 11px; color: #404040;"> <img src="./assets/img/zehibetrag_brutto-icon.png" style="margin-bottom: 5px;" /><br/>
                  Zahibetrag brutto
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item last" style="border-bottom: 0.1mm solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.5454.70 EUR" name="Betrag_brutto_Zahlbetrag" v-model="EditmodalInfo.content[0].Betrag_brutto_Zahlbetrag" /></li>
                </ul>
              </div>
            </div>
            <div class="energicos-letter" style="color: #4a4a4a; font-size: 12px; font-family: energicos-regular; color: #4a4a4a;  text-align: left; padding-bottom:20px;">
              <p class="salutation" style=" margin-bottom: 5px;" >Sehr geehrter Herr Mustermann,</p>
              <p style="margin-bottom: 5px;">für den zurückliegenden Zeitraum berechnen wir Ihnen die im folgenden aufgeführten Entgelte. Die Abrechnungsgrundlagen können Sie der beigefügten Aufstellung auf Seite 2 entnehmen.</p>
            </div>
            <div class="energicos_components_cluster clearfix">
              <div class="cluster" style=" width: 20.4%; float:left;">
                <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Position</div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> Grundkosten </li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="Heizung/Warmwasser" value="Heizung/Warmwasser" name="Position_Verbrauchskosten" v-model="EditmodalInfo.content[0].Position_Verbrauchskosten" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="Vorauszahlungen gesamt" value="Vorauszahlungen gesamt" name="Position_Vorauszahlungen" v-model="EditmodalInfo.content[0].Position_Vorauszahlungen" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="Gebuehren" value="Gebuehren" name="Position_Gebühren" v-model="EditmodalInfo.content[0].Position_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="Gutschriften" value="Gutschriften" name="Position_Gutschriften" v-model="EditmodalInfo.content[0].Position_Gutschriften" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="Rabatt" value="Rabatt" name="Position_Rabatt" v-model="EditmodalInfo.content[0].Position_Rabatt" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="Zahlbetrag" value="Zahlbetrag" name="Position_Zahlbetrag" v-model="EditmodalInfo.content[0].Position_Zahlbetrag" /></span></li>
                </ul>
              </div>
              <div class="cluster" style=" width: 16.5%; float:left; margin-left:.3%;">
                <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Erlauterung</div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">Verbrauchskosten</li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); ">Verbrauchskosten</li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Zahlbetrag</span></li>
                </ul>
              </div>
              <div class="cluster" style=" width: 15.4%; float:left; margin-left:.3%;">
                <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Betrag Netto</div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="320.57 EUR" value="" name="Betrag_netto_Grundkosten" v-model="EditmodalInfo.content[0].Betrag_netto_Grundkosten" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="320.57 EUR" value="" name="Betrag_netto_Verbrauchskosten" v-model="EditmodalInfo.content[0].Betrag_netto_Verbrauchskosten" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="350.00 EUR" value="" name="Betrag_netto_Vorauszahlungen" v-model="EditmodalInfo.content[0].Betrag_netto_Vorauszahlungen" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Betrag_netto_Gebühren" v-model="EditmodalInfo.content[0].Betrag_netto_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Betrag_netto_Gutschriften" v-model="EditmodalInfo.content[0].Betrag_netto_Gutschriften" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Betrag_netto_Rabatt" v-model="EditmodalInfo.content[0].Betrag_netto_Rabatt" /></li>
                  <li class="item last"  style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="" value="" name="Betrag_netto_Zahlbetrag" v-model="EditmodalInfo.content[0].Betrag_netto_Zahlbetrag" /></span></li>
                </ul>
              </div>

              <div class="cluster" style=" width: 15.4%; float:left; margin-left:.3%;">
                <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Umsatzsteuer</div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="60.91 EUR" value="" name="Umsatzsteuer_Gebühren" v-model="EditmodalInfo.content[0].Umsatzsteuer_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="60.91 EUR" value="" name="Umsatzsteuer_Verbrauchskosten" v-model="EditmodalInfo.content[0].Umsatzsteuer_Verbrauchskosten" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="60.91 EUR" value="" name="Umsatzsteuer_Vorauszahlungen" v-model="EditmodalInfo.content[0].Umsatzsteuer_Vorauszahlungen" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Umsatzsteuer_Gebühren" v-model="EditmodalInfo.content[0].Umsatzsteuer_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Umsatzsteuer_Gutschriften" v-model="EditmodalInfo.content[0].Umsatzsteuer_Gutschriften" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Umsatzsteuer_Rabatt" v-model="EditmodalInfo.content[0].Umsatzsteuer_Rabatt" /></li>
                  <li class="item last"  style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="" value="" name="Umsatzsteuer_Zahlbetrag" v-model="EditmodalInfo.content[0].Umsatzsteuer_Zahlbetrag" /></span></li>
                </ul>
              </div>

              <div class="cluster" style=" width: 14.4%; float:left; margin-left:.3%;">
                <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Steuersatz</div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="19%" value="" name="Steuersatz_Gebühren" v-model="EditmodalInfo.content[0].Steuersatz_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="19%" value="" name="Steuersatz_Verbrauchskosten" v-model="EditmodalInfo.content[0].Steuersatz_Verbrauchskosten" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="19%" value="" name="Steuersatz_Vorauszahlungen" v-model="EditmodalInfo.content[0].Steuersatz_Vorauszahlungen" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="19%" value="" name="Steuersatz_Gebühren" v-model="EditmodalInfo.content[0].Steuersatz_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="19%" value="" name="Steuersatz_Gutschriften" v-model="EditmodalInfo.content[0].Steuersatz_Gutschriften" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="19%" value="" name="Steuersatz_Rabatt" v-model="EditmodalInfo.content[0].Steuersatz_Rabatt" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);">
                  <span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="" value="" name="Steuersatz_Zahlbetrag" v-model="EditmodalInfo.content[0].Steuersatz_Zahlbetrag" /></span></li>
                </ul>
              </div>

              <div class="cluster" style=" width: 16.4%; float:left; margin-left:.3%;">
                <div class="cluster-header" style="background-color: rgb(237, 236, 243); border-bottom: solid 0.3px #dddce0; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; margin-bottom: 0.9px; color: #8f0014; text-transform: uppercase; font-size: 11px; letter-spacing: 0.9px; font-family: energicos-medium;">Betrag brutto</div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="381.48 EUR" value="" name="Betrag_brutto_Gebühren" v-model="EditmodalInfo.content[0].Betrag_brutto_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="381.48 EUR" value="" name="Betrag_brutto_Verbrauchskosten" v-model="EditmodalInfo.content[0].Betrag_brutto_Verbrauchskosten" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="381.48 EUR" value="" name="Betrag_brutto_Vorauszahlungen" v-model="EditmodalInfo.content[0].Betrag_brutto_Vorauszahlungen" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Betrag_brutto_Gebühren" v-model="EditmodalInfo.content[0].Betrag_brutto_Gebühren" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Betrag_brutto_Gutschriften" v-model="EditmodalInfo.content[0].Betrag_brutto_Gutschriften" /></li>
                  <li class="item" style="text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px; color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.00" value="" name="Betrag_brutto_Rabatt" v-model="EditmodalInfo.content[0].Betrag_brutto_Rabatt" /></li>
                  <li class="item last"style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242);"><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="" value="" name="Betrag_brutto_Zahlbetrag" v-model="EditmodalInfo.content[0].Betrag_brutto_Zahlbetrag" /></span></li>
                </ul>
              </div>

            </div>
            <div class="energicos-letter" style="color: #4a4a4a; font-size: 12px; font-family: energicos-regular; color: #4a4a4a;  text-align: left; margin-bottom: 15px;">
              <p style="margin-bottom: 5.4px;">Wenn Sie uns ein SEPA Mandat erteilt haben, werden wir den Restbetrag von Ihrem Konto innerhalb von 14 Tagen mit der Gläubiger ID DE123356066666655 unter der Referenz {Rechnungsnummer} einziehen. Guthaben werden von uns in diesem Zeitraum auf das uns benannte Konto überwiesen.</p>

              <p style="margin-bottom: 5.4px;">Haben Sie uns bisher keine Einzugsermächtigung erteilt, bitten wir Sie den Rechnungsbetrag innerhalb von 14 Tagen nach Rechnungserhalt zu überweisen.</p>

              <p style="margin-bottom: 5.4px;">Für die folgende Abrechnungsperiode 2018 ergibt sich ein montlicher Abschlagsbetrag (inklusive Mehrwertsteuer) von {85,00} EUR ab dem 01.01.2018.</p>

              <p style="margin-bottom: 5.4px;">Wir weisen darauf hin, daß gemäß Energieversorgungsvertrag die Zustimmung zu der vorliegenden Abrechnung als erteilt gilt, falls dieser Abrechnung nicht innerhalb einer Frist von vier Wochen ab Rechnungszugang wiedersprochen wird.</p>
            </div>
            <div class="footer-energicos clearfix">
              <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
              <div class="footer-component" style=" width: 18.5%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                energicos energy Gmbh<br/>
                Franklinstrasse 9-11<br/>
                10587 Berlin
              </div>        
              <div class="footer-component" style=" width: 18.5%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Sitz der Gesellschaft:<br/>
                Berlin Amtsgericht<br/>
                Charlottenburg<br/>
                HRB 180072 B USt-IdNr.:<br/>
                DE813522350
              </div>
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Geschäftsführung<br/>
                Dipl.BW (FH) Angelika<br/>
                Hanke<br/>
              </div>        
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00
              </div>        
              <div class="footer-component" style=" width: 22%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00<br/>
                BIC: HYBNAAHRA
              </div>
            </div>
            <div class="energicos-wave" >
              <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
            </div>

          </div>
        </div>
        <div class="utility-bill-container" style="background-color: #fff; margin: auto;">
          <div class="utility-bill-content"  style="background-color: #fff; margin-top: 50px;">
            <div class="energicos-logo" style="text-align: right;">
              <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
            </div>
            
            <div class="key-area" style=" color: #666666; margin-top:10px;">
              <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 12px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Kundenname :</span> <input type="text" placeholder="Max Mustermann" value="Max Mustermann" name="Kundenname" v-model="EditmodalInfo.content[0].Kundenname" /><br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Kundenanschrift :</span>{{ EditmodalInfo.content[0].KD_Strasse }}, {{ EditmodalInfo.content[0].KD_PLZ_Ort }}<br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Vertragsnummer :</span> <input type="text" placeholder="457553-5" value="457553-5" name="Vertragsnummer" v-model="EditmodalInfo.content[0].Vertragsnummer" /><br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Kunden-email :</span>  <input type="text" placeholder="client@email.com" value="client@email.com" name="KD_E_Mail" v-model="EditmodalInfo.content[0].KD_E_Mail" /></p>
              
              <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 0px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Objektnummer :</span> <input type="text" placeholder="4545555" value="4545555" name="Objektnummer" v-model="EditmodalInfo.content[0].Objektnummer" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold';">Lieferadresse :</span> <input type="text" placeholder="Musterstrasse 25, XXXX Ort" value="Musterstrasse 25, XXXX Ort" name="Lieferadresse" v-model="EditmodalInfo.content[0].Lieferadresse" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold';">Rechungsnummer :</span> <input type="text" placeholder="1017W470145" value="1017W470145" name="Rechnungsnummer" v-model="EditmodalInfo.content[0].Rechnungsnummer" />
              </p>
              <p class="current-page" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 8px; letter-spacing: 1px;">Seite 2 von 4</p>
              
            </div>
            <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 18px; letter-spacing: 0.75px; margin-bottom: 15px;">
              <div class="address-top-wrap" style="float: right;">
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;margin-top: -10px;" /> Datum :</span>  <input type="date" placeholder="31.01.2018" value="31.01.2018" name="Rechnungsdatum" v-model="EditmodalInfo.content[0].Rechnungsdatum" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 7px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:-2px; margin-bottom:-4px;margin-top: -5px;" /> Ansprechpartner :</span> <input type="text" placeholder="Birgit Meißner" value="Birgit Meißner" name="Ansprechpartner" v-model="EditmodalInfo.content[0].Ansprechpartner" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px; margin-top: -10px;" /> Telefon :</span> <span>030/ 520098-122</span>
              </div>
            </div>
            <div class="energicos-content">
              <h5 class="main-title" style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;">Verbrauchsermittlung und Rechungspositionen Heizwärme</h5>
              <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbräuche im Abrechnungszeitraum</h6>
            </div>
            
            <div class="energicos_key_components_6cols clearfix">
              <div class="component" style=" width: 14%; float:left;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zähler<br/> 
                  Nummer
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0012121254" value="0012121254" name="Zählernummer_MB1_p1" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0012121254" value="0012121254" name="Zählernummer_MB1_p2" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0012121254" value="0012121254" name="Zählernummer_MB1_p3" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0012121254" value="0012121254" name="Zählernummer_MB1_p4" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">Total</span></li>
                </ul>
              </div>
              <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zeitraum
                  <div class="sub-columns clearfix">
                    <div class="side-1" style=" width: 50%; float:left;">von</div>
                    <div class="side-2" style=" width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_p1" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_p2" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_p3" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_p4" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                    </ul>
                  </div>
                  <div class="side-2" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Zeitraum_bis_MB1_p1" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Zeitraum_bis_MB1_p2" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Zeitraum_bis_MB1_p3" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Zeitraum_bis_MB1_p4" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zählerstand
                  <div class="sub-columns clearfix">
                    <div class="side-1" style=" width: 50%; float:left;">von</div>
                    <div class="side-2" style=" width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="152.645" value="152.645" name="Zählerstand_von_MB1_p1" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="152.645" value="152.645" name="Zählerstand_von_MB1_p2" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="152.645" value="152.645" name="Zählerstand_von_MB1_p3" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="152.645" value="152.645" name="Zählerstand_von_MB1_p4" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                    </ul>
                  </div>
                  <div class="side-2" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="136.563" value="136.563" name="Zählerstand_bis_MB1_p1" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="136.563" value="136.563" name="Zählerstand_bis_MB1_p2" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="136.563" value="136.563" name="Zählerstand_bis_MB1_p3" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="136.563" value="136.563" name="Zählerstand_bis_MB1_p4" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauch<br/>
                  in kWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_Verbrauchseinheit_MB1_p1" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_Verbrauchseinheit_MB1_p2" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_Verbrauchseinheit_MB1_p3" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_Verbrauchseinheit_MB1_p4" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="" value="" name="Verbrauch_in_Verbrauchseinheit_MB1_p5" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p5" /></li>
                </ul>
              </div>
              <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Umrechung<br/>
                  Faktor
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.001" value="0.001" name="Umrechnungsfaktor_MB1_p1" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.001" value="0.001" name="Umrechnungsfaktor_MB1_p2" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.001" value="0.001" name="Umrechnungsfaktor_MB1_p3" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="0.001" value="0.001" name="Umrechnungsfaktor_MB1_p4" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="" value="" name="Umrechnungsfaktor_MB1_p5" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p5" /></li>
                </ul>
              </div>
              <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauch<br/>
                  in MWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_MWh_MB1_p1" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_MWh_MB1_p2" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_MWh_MB1_p3" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1.527" value="1.527" name="Verbrauch_in_MWh_MB1_p4" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_p5" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p5" /></li>
                </ul>
              </div>
            </div>
            <div class="energicos-content">
              <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbrauchspreise im Abrechnungszeitraum</h6>
            </div>
            
            <div class="energicos_key_components_5cols clearfix">
              <div class="component" style="width: 22%; float:left;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zeitraum
                  <div class="sub-columns clearfix">
                    <div class="side-1" style="width: 50%; float:left;">von</div>
                    <div class="side-2" style="width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1 " style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_ap1" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_ap2" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_ap3" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_von_MB1_ap4" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">Total</span></li>
                    </ul>
                  </div>
                  <div class="side-2" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Verbrauch_in_MWh_MB1_ap1" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Verbrauch_in_MWh_MB1_ap2" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Verbrauch_in_MWh_MB1_ap3" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="31.01.2017" value="31.01.2017" name="Verbrauch_in_MWh_MB1_ap4" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Blank</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchsmenge<br/> 
                  in MWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Verbrauchspreis_MB1_ap1" v-model="EditmodalInfo.content[0].Verbrauchspreis_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Verbrauchspreis_MB1_ap2" v-model="EditmodalInfo.content[0].Verbrauchspreis_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Verbrauchspreis_MB1_ap3" v-model="EditmodalInfo.content[0].Verbrauchspreis_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Verbrauchspreis_MB1_ap4" v-model="EditmodalInfo.content[0].Verbrauchspreis_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="" value="" name="Total_Verbrauchspreis_MB1" v-model="EditmodalInfo.content[0].Total_Verbrauchspreis_MB1" /></span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Abrechnungspreis<br/>
                  in EUR / MWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Änderungsfaktor_MB1_ap1" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Änderungsfaktor_MB1_ap2" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Änderungsfaktor_MB1_ap3" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Änderungsfaktor_MB1_ap4" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">blank</span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Preisänderungs<br/>
                  Faktor
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Verbrauchskosten_MB1_ap1" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Verbrauchskosten_MB1_ap2" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Verbrauchskosten_MB1_ap3" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Verbrauchskosten_MB1_ap4" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"><input type="text" placeholder="" value="" name="Total_Verbrauchskosten_MB1" v-model="EditmodalInfo.content[0].Total_Verbrauchskosten_MB1" /></span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchskosten<br/>
                  netto in EUR
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Verbrauchskosten_MB1_ap1" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Verbrauchskosten_MB1_ap2" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Verbrauchskosten_MB1_ap3" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Verbrauchskosten_MB1_ap4" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="5.752" value="5.752" name="Total_Verbrauchspreis_MB1" v-model="EditmodalInfo.content[0].Total_Verbrauchspreis_MB1" /></span></li>
                </ul>
              </div>
            </div>
            <div class="energicos-content">
              <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Grundpreise im Abrechnungszeitraum</h6>
            </div>
            
            <div class="energicos_key_components_5cols clearfix">
              <div class="component" style="width: 22%; float:left;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zeitraum
                  <div class="sub-columns clearfix">
                    <div class="side-1" style="width: 50%; float:left;">von</div>
                    <div class="side-2" style="width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1 " style="width: 50%; float:left;">
                      <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                        <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Zeitraum_von_MB1_gp1" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp1" /></li>
                        <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Zeitraum_von_MB1_gp2" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp2" /></li>
                        <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Zeitraum_von_MB1_gp3" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp3" /></li>
                        <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Zeitraum_von_MB1_gp4" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp4" /></li>
                        <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                      </ul>
                  </div>

                  <div class="side-1 " style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_bis_MB1_gp1" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_bis_MB1_gp2" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_bis_MB1_gp3" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="date" placeholder="01.01.2017" value="01.01.2017" name="Zeitraum_bis_MB1_gp4" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchsmenge<br/> 
                  in MWh
                </div>
                  <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                    <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Zeitraum_bis_MB1_gp1" v-model="EditmodalInfo.content[0].Leistung_MB1_gp1" /></li>
                    <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Zeitraum_bis_MB1_gp2" v-model="EditmodalInfo.content[0].Leistung_MB1_gp2" /></li>
                    <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Zeitraum_bis_MB1_gp3" v-model="EditmodalInfo.content[0].Leistung_MB1_gp3" /></li>
                    <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.520,25" value="3.520,25" name="Zeitraum_bis_MB1_gp4" v-model="EditmodalInfo.content[0].Leistung_MB1_gp4" /></li>
                    <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                  </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Abrechnungspreis<br/>
                  in EUR / kw * a
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Zeitraum_bis_MB1_gp1" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Zeitraum_bis_MB1_gp2" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Zeitraum_bis_MB1_gp3" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="44,45" value="44,45" name="Zeitraum_bis_MB1_gp4" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="42,15" value="" name="Total_Grundpreis_MB1" v-model="EditmodalInfo.content[0].Total_Grundpreis_MB1" /></span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Preisänderungs<br/>
                  Faktor
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Änderungsfaktor_MB1_gp1" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Änderungsfaktor_MB1_gp1" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Änderungsfaktor_MB1_gp1" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="1,57" value="1,57" name="Änderungsfaktor_MB1_gp1" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp1" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchskosten<br/>
                  netto in EUR
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Grundkosten_MB1_gp1" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Grundkosten_MB1_gp2" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Grundkosten_MB1_gp3" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><input type="text" placeholder="3.587,25" value="3.587,25" name="Grundkosten_MB1_gp4" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"></span></li>
                </ul>
              </div>
            </div>
            <div class="footer-energicos clearfix">
              <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
              <div class="footer-component" style=" width: 18.5%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                energicos energy Gmbh<br/>
                Franklinstrasse 9-11<br/>
                10587 Berlin
              </div>        
              <div class="footer-component" style=" width: 18.5%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Sitz der Gesellschaft:<br/>
                Berlin Amtsgericht<br/>
                Charlottenburg<br/>
                HRB 180072 B USt-IdNr.:<br/>
                DE813522350
              </div>
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Geschäftsführung<br/>
                Dipl.BW (FH) Angelika<br/>
                Hanke<br/>
              </div>        
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00
              </div>        
              <div class="footer-component" style=" width: 22%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00<br/>
                BIC: HYBNAAHRA
              </div>
            </div>
            <div class="energicos-wave" >
              <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
            </div>      
          </div>
        </div>
        <div class="utility-bill-container" style="background-color: #fff; margin: auto;">
          <div class="utility-bill-content"  style="background-color: #fff;margin-top: 50px;">
            <div class="energicos-logo" style="text-align: right;">
              <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
            </div>                
            <div class="key-area" style=" color: #666666; margin-top:10px;">
              <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 12px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Kundenname :</span> <input type="text" placeholder="Kundenname" value="" name="Kundenname" v-model="EditmodalInfo.content[0].Kundenname" /><br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Kundenanschrift :</span> {{ EditmodalInfo.content[0].KD_Strasse }}, {{ EditmodalInfo.content[0].KD_PLZ_Ort }}<br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Vertragsnummer :</span> <input type="text" placeholder="" value="" name="Vertragsnummer" v-model="EditmodalInfo.content[0].Vertragsnummer" /><br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Kunden-email :</span>  <input type="text" placeholder="" value="" name="KD_E_Mail" v-model="EditmodalInfo.content[0].KD_E_Mail" /> </p>
              
              <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 0px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Objektnummer :</span> <input type="text" placeholder="Objektnummer" value="" name="Objektnummer" v-model="EditmodalInfo.content[0].Objektnummer" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold';">Lieferadresse :</span> <input type="text" placeholder="" value="" name="Lieferadresse" v-model="EditmodalInfo.content[0].Lieferadresse" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold';">Rechungsnummer :</span> <input type="text" placeholder="" value="" name="Rechnungsnummer" v-model="EditmodalInfo.content[0].Rechnungsnummer" />
              </p>
              <p class="current-page" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 8px; letter-spacing: 1px;">Seite 2 von 4</p>
              
            </div>
            <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 18px; letter-spacing: 0.75px; margin-bottom: 15px;">
              <div class="address-top-wrap" style="float: right;">
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;margin-top: -10px;" /> Datum :</span>   <input type="date" placeholder="" value="" name="Rechnungsdatum" v-model="EditmodalInfo.content[0].Rechnungsdatum" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 7px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:-2px; margin-bottom:-4px;margin-top: -5px;" /> Ansprechpartner :</span> <input type="text" placeholder="" value="" name="Ansprechpartner" v-model="EditmodalInfo.content[0].Ansprechpartner" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px; margin-top: -10px;" /> Telefon :</span> <span>030/ 520098-122</span>
              </div>
            </div>
            <div class="energicos-content">
              <h5 class="main-title" style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;">Verbrauchsermittlung und Rechungspositionen Warmwasser</h5>
              <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbräuche Warmwasser im Abrechnungszeitraum</h6>
            </div>
            
            <div class="energicos_key_components_6cols clearfix">
              <div class="component" style=" width: 14%; float:left;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zähler<br/> 
                  Nummer
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählernummer_MB1_p1" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählernummer_MB1_p2" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählernummer_MB1_p3" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählernummer_MB1_p4" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="" value="" name="Zählernummer_MB1_p5" v-model="EditmodalInfo.content[0].Zählernummer_MB1_p5" /></span></li>
                </ul>
              </div>
              <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zeitraum
                  <div class="sub-columns clearfix">
                    <div class="side-1" style=" width: 50%; float:left;">von</div>
                    <div class="side-2" style=" width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_p1" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_p2" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_p3" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_p4" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_p5" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_p5" /></span></li>
                    </ul>
                  </div>
                  <div class="side-2" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_p1" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_p2" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_p3" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_p4" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_p5" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_p5" /></span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="component" style=" width: 21%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zählerstand
                  <div class="sub-columns clearfix">
                    <div class="side-1" style=" width: 50%; float:left;">von</div>
                    <div class="side-2" style=" width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_von_MB1_p1" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_von_MB1_p2" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_von_MB1_p3" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_von_MB1_p4" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color: #fff"> <input type="text" placeholder="" value="" name="Zählerstand_von_MB1_p5" v-model="EditmodalInfo.content[0].Zählerstand_von_MB1_p5" /></span></li>
                    </ul>
                  </div>
                  <div class="side-2" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_bis_MB1_p1" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_bis_MB1_p2" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_bis_MB1_p3" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zählerstand_bis_MB1_p4" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color#fff;">  <input type="text" placeholder="" value="" name="Zählerstand_bis_MB1_p5" v-model="EditmodalInfo.content[0].Zählerstand_bis_MB1_p5" /></span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauch<br/>
                  in kWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_Verbrauchseinheit_MB1_p1" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_Verbrauchseinheit_MB1_p2" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_Verbrauchseinheit_MB1_p3" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_Verbrauchseinheit_MB1_p4" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px; "> <input type="text" placeholder="" value="" name="Verbrauch_in_Verbrauchseinheit_MB1_p5" v-model="EditmodalInfo.content[0].Verbrauch_in_Verbrauchseinheit_MB1_p5" /></span></li>
                </ul>
              </div>
              <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Umrechung<br/>
                  Faktor
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Umrechnungsfaktor_MB1_p1" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Umrechnungsfaktor_MB1_p2" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Umrechnungsfaktor_MB1_p3" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Umrechnungsfaktor_MB1_p4" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;"> <input type="text" placeholder="" value="" name="Umrechnungsfaktor_MB1_p5" v-model="EditmodalInfo.content[0].Umrechnungsfaktor_MB1_p5" /> </span></li>
                </ul>
              </div>
              <div class="component"  style=" width: 14%; float:left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauch<br/>
                  in MWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_p1" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_p2" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_p3" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_p4" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total"  style="font-family: energicos-bold ; font-size: 11px; ">  <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_p5" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_p5" /></span></li>
                </ul>
              </div>
            </div>             
            <div class="energicos-content">
              <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Verbrauchskosten Warmwasser im Abrechnungszeitraum</h6>
            </div>
            
            <div class="energicos_key_components_5cols clearfix">
              <div class="component" style="width: 22%; float:left;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zeitraum
                  <div class="sub-columns clearfix">
                    <div class="side-1" style="width: 50%; float:left;">von</div>
                    <div class="side-2" style="width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1 " style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_von_MB1_ap1" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_von_MB1_ap2" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_von_MB1_ap3" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_von_MB1_ap4" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_ap4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">Total</span></li>
                    </ul>
                  </div>
                  <div class="side-2" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_bis_MB1_ap1" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_ap1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_bis_MB1_ap2" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_ap2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_bis_MB1_ap3" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_ap3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="date" placeholder="" value="" name="Zeitraum_bis_MB1_ap4" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_ap4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Blank</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchsmenge<br/> 
                  in MWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi2os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap1" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap2" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi4os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap3" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap4" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Abrechnungspreis<br/>
                  in EUR / MWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap1" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap2" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap3" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauch_in_MWh_MB1_ap4" v-model="EditmodalInfo.content[0].Verbrauch_in_MWh_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> <input type="text" placeholder="" value="" name="Total_Verbrauchspreis_MB1" v-model="EditmodalInfo.content[0].Total_Verbrauchspreis_MB1" /></span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Preisänderungs<br/>
                  Fakto1
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi2os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_ap1" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_ap2" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energi4os-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_ap3" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_ap4" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchskosten<br/>
                  netto in EUR
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauchskosten_MB1_ap1" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauchskosten_MB1_ap2" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauchskosten_MB1_ap3" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Verbrauchskosten_MB1_ap4" v-model="EditmodalInfo.content[0].Verbrauchskosten_MB1_ap4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"> <input type="text" placeholder="" value="" name="Total_Verbrauchskosten_MB1" v-model="EditmodalInfo.content[0].Total_Verbrauchskosten_MB1" /></span></li>
                </ul>
              </div>
            </div>
            <div class="energicos-content">
              <h6 class="sub-title" style="font-family: 'energicos-semibold'; color: #404040; letter-spacing: 0.3px; margin-top: -4.5px; margin-bottom: 4px;">Grundkosten Warmwasser im Abrechnungszeitraum</h6>
            </div>
            
            <div class="energicos_key_components_5cols clearfix">
              <div class="component" style="width: 22%; float:left;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Zeitraum
                  <div class="sub-columns clearfix">
                    <div class="side-1" style="width: 50%; float:left;">von</div>
                    <div class="side-2" style="width: 50%; float:left;">bis</div>
                  </div>
                </div>
                <div class="sub-columns clearfix">
                  <div class="side-1 " style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_gp1" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_gp2" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_gp3" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_von_MB1_gp4" v-model="EditmodalInfo.content[0].Zeitraum_von_MB1_gp4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">Total</span></li>
                    </ul>
                  </div>
                  <div class="side-2" style="width: 50%; float:left;">
                    <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_gp1" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp1" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_gp2" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp2" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_gp3" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp3" /></li>
                      <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Zeitraum_bis_MB1_gp4" v-model="EditmodalInfo.content[0].Zeitraum_bis_MB1_gp4" /></li>
                      <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">Blank</span></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchsmenge<br/> 
                  in MWh
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Leistung_MB1_gp1" v-model="EditmodalInfo.content[0].Leistung_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Leistung_MB1_gp2" v-model="EditmodalInfo.content[0].Leistung_MB1_gp2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Leistung_MB1_gp3" v-model="EditmodalInfo.content[0].Leistung_MB1_gp3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Leistung_MB1_gp4" v-model="EditmodalInfo.content[0].Leistung_MB1_gp4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">5.752</span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Abrechnungspreis<br/>
                  in EUR / kw * a
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundpreis_MB1_gp1" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundpreis_MB1_gp2" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundpreis_MB1_gp3" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundpreis_MB1_gp4" v-model="EditmodalInfo.content[0].Grundpreis_MB1_gp4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;"><input type="text" placeholder="" value="" name="Total_Grundpreis_MB1" v-model="EditmodalInfo.content[0].Total_Grundpreis_MB1" /></span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Preisänderungs<br/>
                  Faktor
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_gp1" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_gp2" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_gp3" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Änderungsfaktor_MB1_gp4" v-model="EditmodalInfo.content[0].Änderungsfaktor_MB1_gp4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total blank" style="font-family: energicos-bold ; font-size: 11px; color:#fff;">blank</span></li>
                </ul>
              </div>
              <div class="component" style="width: 19%; float:left; margin-left:0.5%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Verbrauchskosten<br/>
                  netto in EUR
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; border: 0px;">
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundkosten_MB1_gp1" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp1" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundkosten_MB1_gp2" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp2" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundkosten_MB1_gp3" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp3" /></li>
                  <li class="item" style=" text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "> <input type="text" placeholder="" value="" name="Grundkosten_MB1_gp4" v-model="EditmodalInfo.content[0].Grundkosten_MB1_gp4" /></li>
                  <li class="item last" style=" border-bottom: 0.37px solid #e1e0e5; text-align: center; padding-top: 6px; padding-bottom: 6px; font-family: energicos-regular; font-size: 11px; letter-spacing: 0.37px;color: #666666; border-top: 0.37px solid rgb(242, 242, 242); "><span class="total" style="font-family: energicos-bold ; font-size: 11px;">  <input type="text" placeholder="" value="" name="Total_Grundkosten_MB1" v-model="EditmodalInfo.content[0].Total_Grundkosten_MB1" /></span></li>
                </ul>
              </div>
            </div>
            <div class="footer-energicos clearfix">
              <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
              <div class="footer-component" style=" width: 18.5%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                energicos energy Gmbh<br/>
                Franklinstrasse 9-11<br/>
                10587 Berlin
              </div>                  
              <div class="footer-component" style=" width: 18.5%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Sitz der Gesellschaft:<br/>
                Berlin Amtsgericht<br/>
                Charlottenburg<br/>
                HRB 180072 B USt-IdNr.:<br/>
                DE813522350
              </div>
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Geschäftsführung<br/>
                Dipl.BW (FH) Angelika<br/>
                Hanke<br/>
              </div>                  
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00
              </div>                  
              <div class="footer-component" style=" width: 22%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00<br/>
                BIC: HYBNAAHRA
              </div>
            </div>
            <div class="energicos-wave" >
              <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
            </div>                
          </div>
        </div>
        <div class="utility-bill-container" style="background-color: #fff; margin: auto;">
          <div class="utility-bill-content"   style="background-color: #fff; margin-top: 50px;">
            <div class="energicos-logo" style="text-align: right;">
              <img src="./assets/img/energicos-logo.png" width="180mm" alt="energicos logo"/>
            </div>
            
            <div class="key-area" style=" color: #666666; margin-top:10px;">
              <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 12px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Kundenname :</span> <input type="text" placeholder="" value="" name="Kundenname" v-model="EditmodalInfo.content[0].Kundenname" /><br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Kundenanschrift :</span> {{ EditmodalInfo.content[0].KD_Strasse }}, {{ EditmodalInfo.content[0].KD_PLZ_Ort }}<br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Vertragsnummer :</span>  <input type="text" placeholder="" value="" name="Vertragsnummer" v-model="EditmodalInfo.content[0].Vertragsnummer" /><br/>
              <span class="energicos-important" style="font-family: 'energicos-bold';">Kunden-email :</span>   <input type="text" placeholder="" value="" name="KD_E_Mail" v-model="EditmodalInfo.content[0].KD_E_Mail" /></p>
              
              <p style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 16px; letter-spacing: 0.75px; margin-bottom: 0px;"><span class="energicos-important" style="font-family: 'energicos-bold';">Objektnummer :</span> <input type="text" placeholder="" value="" name="Objektnummer" v-model="EditmodalInfo.content[0].Objektnummer" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold';">Lieferadresse :</span> <input type="text" placeholder="" value="" name="Lieferadresse" v-model="EditmodalInfo.content[0].Lieferadresse" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold';">Rechungsnummer :</span> <input type="text" placeholder="" value="" name="Rechnungsnummer" v-model="EditmodalInfo.content[0].Rechnungsnummer" />
              </p>
              <p class="current-page" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 8px; letter-spacing: 1px;">Seite 2 von 4</p>
              
            </div>
            <div class="address-top clearfix" style="font-family: 'energicos-regular'; font-size: 13px; color: #666666; line-height: 18px; letter-spacing: 0.75px; margin-bottom: 15px;">
              <div class="address-top-wrap" style="float: right;">
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/datum-icon.png" style="margin-right:5px; margin-bottom:-4px;margin-top: -10px;" /> Datum :</span>  <input type="date" placeholder="" value="" name="Rechnungsdatum" v-model="EditmodalInfo.content[0].Rechnungsdatum" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 7px; display: inline-block;"> <img src="./assets/img/ansprechpartner-icon.png" style="margin-right:-2px; margin-bottom:-4px;margin-top: -5px;" /> Ansprechpartner :</span> <input type="text" placeholder="" value="" name="Ansprechpartner" v-model="EditmodalInfo.content[0].Ansprechpartner" /><br/>
                <span class="energicos-important" style="font-family: 'energicos-bold'; margin-bottom: 5px; display: inline-block;"> <img src="./assets/img/telefon-icon.png" style="margin-right:5px; margin-bottom:-4px; margin-top: -10px;" /> Telefon :</span> <span>030/ 520098-122</span>
              </div>
            </div>
            <div class="energicos-content" >
              <h5 class="main-title" style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px; margin-top: 0px;">Referenzwerte</h5>
            </div>

            <div class="energicos_key_components_4cols clearfix">
              <div class="component component-header-blank" style="width: 33%; float: left; margin-top: 32px;">
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px;">
                  <li class="item-left"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242);"> <input type="text" placeholder="" value="" name="Verbrauch" v-model="EditmodalInfo.content[0].Verbrauch" /></li>
                  <li class="item-left"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242);"><input type="text" placeholder="" value="" name="Energieentgelte" v-model="EditmodalInfo.content[0].Energieentgelte" /></li>
                  <li class="item-left"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242);"> <input type="text" placeholder="" value="" name="Gaspreis_Mittel_Jahr" v-model="EditmodalInfo.content[0]['Gaspreis Mittel Jahr']" /></li>
                  <li class="item-left last" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); border-bottom: 0.1mm solid #e1e0e5;"> <input type="text" placeholder="" value="" name="Verbrauch_je_m" v-model="EditmodalInfo.content[0].Verbrauch_je_m" /></li>
                </ul>
              </div>
              <div class="component" style="width: 27%; float: left; margin-left:0.3%;">
                <div class="component-header2" style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Abrechnungsperiode
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px;">
                  <li class="item" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;"> 35,567 MWh</li>
                  <li class="item" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">3,470.56 EUR</li>
                  <li class="item" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">44.50 EUR/MWh</li>
                  <li class="item last" style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); border-bottom: 0.1mm solid #e1e0e5; text-align: center;">105 kWh/m2</li>
                </ul>
              </div>
              <div class="component" style="width: 27%; float: left; margin-left:0.3%;">
                <div class="component-header2"  style="background-color: #f5f5f5; width: 100%; padding-top: 7.5px; padding-bottom: 7.5px; text-align: center; border-bottom: solid 0.3px #c30017; margin-bottom: 0.3px; font-family: 'energicos-regular'; font-size: 13px; color: #404040;">
                  Vorperiode
                </div>
                <ul class="items" style="padding-left: 0px; list-style: none; width: 100%; margin-top: 0px; text-align: center;">
                  <li class="item"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">35,567 MWh</li>
                  <li class="item"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">3,470.56 EUR</li>
                  <li class="item"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); text-align: center;">44.50 EUR/MWh</li>
                  <li class="item last"  style="text-align: left; padding-top: 6px; padding-bottom: 6px; font-family: 'energicos-regular'; font-size: 11px; letter-spacing: 0.3px; color: #666666;border-top: 0.3px solid rgb(242, 242, 242); border-bottom: 0.1mm solid #e1e0e5; text-align: center;">105 kWh/m2</li>
                </ul>
              </div>
            </div>
            <div class="energicos-content">
              <div class="energicos-red"  style="background-color: rgb(195, 0, 23); height: 0.7px; margin-top: 11px; margin-bottom: 11px;"></div>
              <h5 class="main-title"  style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;  margin-top: 0px;">Aufteilung Wärme/ Warmwasser</h5>
            </div>

            <div class="energicos_key_components_2cols clearfix"  style="font-size: 11px; font-family: 'energicos-regular'; color: #4a4a4a; line-height: 17px;">
              <div class="side-1-energicos" style=" width:26.5%;  float: left;">
                <img src="./assets/img/pie-chart.svg" width="180px" alt="graphics-key"/>
              </div>

              <div class="side-2-energicos" style=" width: 68.5%; margin-left:2%; float: left;">
                <p class="Aufteilung-spacer" style="margin-top:30px;">Die Heizkostenverordnung sieht vor, die Kosten für Wärme für Heizzwecke und Warmwasseraufbereitung aufzuteilen. Dazu müssen seit 2013 separate Warmwasserzähler installiert sein. Der Warmwasseranteil sollte nicht höher als 18% der Gesamtwärmekosten liegen. Insbesondere ein Abgleich der Warmwasser-Zirkulationssystems kann hierbei zu erheblichen Einsparungen führen. Wir setzen das gern mit Ihnen zusammen um, sprechen Sie uns bitte an!</p>
              </div>
            </div>

            <div class="energicos-content">
              <div class="energicos-red" style="background-color: rgb(195, 0, 23); height: 0.7px; margin-top: 11px; margin-bottom: 11px;"></div>
              <h5 class="main-title"  style="font-family: 'energicos-bold'; color: #404040; letter-spacing: 0.3px; margin-bottom: 5px;  margin-top: 0px;">Betriebskostenoptimierung</h5>
            </div>

            <div class="energicos_key_components_2cols clearfix" style="font-size: 11px; font-family: 'energicos-regular'; color: #4a4a4a; line-height: 17px;">
              <div class="side-1-energicos" style="width:  48%; float: left;">
                <p style="margin-top: 0px; margin-bottom:5px;">Mit der Darstellung der Gebäude Energieeffizienzklassen soll, ähnlich wie bereits bei Haushaltsgeräten üblich, Kauf- oder Mietinteressenten eine schnelle Einordnung des energetischen Zustands des Gebäudes ermöglicht werden.Im Sinne einer maximalen Betriebskostenoptimierung sollten Mieter, Gebäudebesitzer und Energielieferant in dieser Hinsicht an einem Strang ziehen um den Verbrauch des Gebäudes je m2 zu minimieren. Wenn Sie daran interessiert sind, rufen Sie uns bitte an!</p>
              </div>

              <div class="side-2-energicos" style=" width: 48%; float: left; margin-left: 2%; ">
                <img src="./assets/img/graphic-key.png" width="360px" alt="graphics-key"/>
                </div>
            </div>

            <div class="footer-energicos clearfix">
              <div class="horizontal-divider" style="margin-bottom: 15px;"><hr class="energicos-footer-line" style="border-bottom: 0.37px solid #e1e0e5;" /></div>
              <div class="footer-component" style=" width: 18.5%; float: left; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                energicos energy Gmbh<br/>
                Franklinstrasse 9-11<br/>
                10587 Berlin
              </div>
              
              <div class="footer-component" style=" width: 18.5%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Sitz der Gesellschaft:<br/>
                Berlin Amtsgericht<br/>
                Charlottenburg<br/>
                HRB 180072 B USt-IdNr.:<br/>
                DE813522350
              </div>
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Geschäftsführung<br/>
                Dipl.BW (FH) Angelika<br/>
                Hanke<br/>
              </div>
              
              <div class="footer-component" style=" width: 19%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00
              </div>

              
              <div class="footer-component" style=" width: 22%; float: left; margin-left: 0.75%; font-family: energicos-regular; color: #4a4a4a; font-size: 10px; letter-spacing: 0.5px; line-height: 14px;">
                Hypovereinsbank<br/>
                Konto: 2245343<br/>
                IBAN: DE23235434846446554<br/>
                BLZ: 100 500 00<br/>
                BIC: HYBNAAHRA
              </div>
            </div>

            <div class="energicos-wave" >
              <img src="./assets/img/stripe.png" alt="stripe" width="350px"/>
            </div>
          </div>
        </div>

        <b-row>
          <b-button style="text-align: center; margin: 0 auto; margin-top: 20px; padding: 10px 20px;" size="sm" @click.stop="updateInvociem(EditmodalInfo.content[0].Rechnungsdatensatz, $event.target)">
              Update Invoice
            </b-button>
        </b-row>

      </div>
    </b-modal>

  </b-container>

</template>

<script>
  import axios from 'axios';
  import loading from 'vue-full-loading';
  let items = [];
  let invoicenumber = [];
  let allcontractnum = [];

  const endpointurl = 'http://localhost:3000/api/invoice_pk_invoicenumber';

  export default {
    name: 'InvoiceRecords',
    components: {
      loading
    },
    filters: {
      unescape: v => unescape(v)
    },
    data () {
      return {
        items: items,
        invoicenumber: invoicenumber,
        fields: [
          { key: 'Rechnungsdatensatz', label: 'Rechnungsdatensatz', sortable: true, 'class': 'text-center' }, // Invoice Record
          { key: 'Vertragsnummer', label: 'Vertragsnummer', sortable: true, 'class': 'text-center' }, // Contract Number
          { key: 'Rechnungsnummer', label: 'Rechnungsnummer', sortable: true, 'class': 'text-center' }, // Bill Number
          { key: 'Rechnungsdatum', label: 'Rechnungsdatum', sortable: true, 'class': 'text-center' }, // Date of Invoice
          { key: 'Kundenname', label: 'Kundenname', sortable: true, 'class': 'text-center' }, // Bill Number
          { key: 'KD_E-Mail', label: 'KD_E-Mail', sortable: true, 'class': 'text-center' }, // Email
          { key: 'Ansprechpartner', label: 'Ansprechpartner', sortable: true, 'class': 'text-center' }, // Contact Person
          { key: 'actions', label: 'View Record' },
          { key: 'editactions', label: 'Edit Record' },
          { key: 'invoiceactions', label: 'Generate Invoice' }
        ],
        currentPage: 1,
        perPage: 5,
        totalRows: items.length,
        pageOptions: [ 5, 10, 15 ],
        sortBy: null,
        sortDesc: false,
        filter: null,
        modalInfo: { title: '', content: '' },
        EditmodalInfo: { title: '', content: '' },
        startDate: '',
        endDate: '',
        generatePDF: false,
        show: false,
        label: 'Loading...',
        Kundenname: '',
        strasseplz: '',
        ort: '',
        Rechnungsdatum: '',
        Ansprechpartner: '',
        Telefon: '',
        Vertragsnummer: '',
        Objektnummer: '',
        Rechnungsnummer: '',
        Rechnungvon: '',
        Rechnungbis: '',
        Zahibetragbrutto: '',
        Grundkosten: '',
        Verbrauchskosten1: '',
        Verbrauchskosten2: '',
        Verbrauchskosten3: '',
        Verbrauchskosten4: '',
        Verbrauchskosten5: '',
        Verbrauchskosten6: '',
        Position_Verbrauchskosten: '',
        Position_Vorauszahlungen: '',
        Position_Geb_chren: '',
        Position_Gutschriften: '',
        Position_Rabatt: '',
        Position_Zahlbetrag: '',
        Position_Zahlbetrag2: '',
        Betrag_netto_Grundkosten: '',
        Betrag_netto_Verbrauchskosten: '',
        Betrag_netto_Vorauszahlungen: '',
        Betrag_netto_Gebfchren: '',
        Betrag_netto_Gutschriften: '',
        Betrag_netto_Rabatt: '',
        Betrag_netto_Zahlbetrag: '',
        Umsatzsteuer_Grundkosten: '',
        Umsatzsteuer_Verbrauchskosten: '',
        Umsatzsteuer_Vorauszahlungen: '',
        Umsatzsteuer_Gebfchren: '',
        Umsatzsteuer_Gutschriften: '',
        Umsatzsteuer_Rabatt: '',
        Umsatzsteuer_Zahlbetrag: '',
        Steuersatz_Grundkosten: '',
        Steuersatz_Verbrauchskosten: '',
        Steuersatz_Vorauszahlungen: '',
        Steuersatz_Gebfchren: '',
        Steuersatz_Gutschriften: '',
        Steuersatz_Rabatt: '',
        Steuersatz_Zahlbetrag: '',
        Betrag_brutto_Grundkosten: '',
        Betrag_brutto_Verbrauchskosten: '',
        Betrag_brutto_Vorauszahlungen: '',
        Betrag_brutto_Gebfchren: '',
        Betrag_brutto_Gutschriften: '',
        Betrag_brutto_Rabatt: '',
        Betrag_brutto_Zahlbetrag: '',
        Vertragsnummer: '',
        Kundenanschrift: '',
        Vertragsnummer: '',
        Lieferadresse: '',
        ZNhlernummer_MB1_p1: '',
        ZNhlernummer_MB1_p2: '',
        ZNhlernummer_MB1_p3: '',
        ZNhlernummer_MB1_p4: '',
        Zeitraum_von_MB1_p1: '',
        Zeitraum_von_MB1_p2: '',
        Zeitraum_von_MB1_p3: '',
        Zeitraum_von_MB1_p4: '',
        Zeitraum_bis_MB1_p1: '',
        Zeitraum_bis_MB1_p2: '',
        Zeitraum_bis_MB1_p3: '',
        Zeitraum_bis_MB1_p4: '',
        ZNhlerstand_von_MB1_p1: '',
        ZNhlerstand_von_MB1_p2: '',
        ZNhlerstand_von_MB1_p3: '',
        ZNhlerstand_von_MB1_p4: '',
        ZNhlerstand_bis_MB1_p1: '',
        ZNhlerstand_bis_MB1_p2: '',
        ZNhlerstand_bis_MB1_p3: '',
        ZNhlerstand_bis_MB1_p4: '',
        Verbrauch_in_Verbrauchseinheit_MB1_p1: '',
        Verbrauch_in_Verbrauchseinheit_MB1_p2: '',
        Verbrauch_in_Verbrauchseinheit_MB1_p3: '',
        Verbrauch_in_Verbrauchseinheit_MB1_p4: '',
        Verbrauch_in_Verbrauchseinheit_MB1_p5: '',
        Umrechnungsfaktor_MB1_p1: '',
        Umrechnungsfaktor_MB1_p2: '',
        Umrechnungsfaktor_MB1_p3: '',
        Umrechnungsfaktor_MB1_p4: '',
        Umrechnungsfaktor_MB1_p5: '',
        Verbrauch_in_MWh_MB1_p1: '',
        Verbrauch_in_MWh_MB1_p2: '',
        Verbrauch_in_MWh_MB1_p3: '',
        Verbrauch_in_MWh_MB1_p4: '',
        Verbrauch_in_MWh_MB1_p5: '',
        Zeitraum_von_MB1_ap1: '',
        Zeitraum_von_MB1_ap2: '',
        Zeitraum_von_MB1_ap3: '',
        Zeitraum_von_MB1_ap4: '',
        Verbrauch_in_MWh_MB1_ap1: '',
        Verbrauch_in_MWh_MB1_ap2: '',
        Verbrauch_in_MWh_MB1_ap3: '',
        Verbrauch_in_MWh_MB1_ap4: '',
        Verbrauchspreis_MB1_ap1: '',
        Verbrauchspreis_MB1_ap2: '',
        Verbrauchspreis_MB1_ap3: '',
        Verbrauchspreis_MB1_ap4: '',
        Total_Verbrauchspreis_MB1: '',
        Abnderungsfaktor_MB1_ap1: '',
        Abnderungsfaktor_MB1_ap2: '',
        Abnderungsfaktor_MB1_ap3: '',
        Abnderungsfaktor_MB1_ap4: '',
        Verbrauchskosten_MB1_ap1: '',
        Verbrauchskosten_MB1_ap2: '',
        Verbrauchskosten_MB1_ap3: '',
        Verbrauchskosten_MB1_ap4: '',
        Total_Verbrauchskosten_MB1: '',
        Verbrauchskosten_MB1_gp1: '',
        Verbrauchskosten_MB1_gp2: '',
        Verbrauchskosten_MB1_gp3: '',
        Verbrauchskosten_MB1_gp4: '',
        Zeitraum_von_MB1_gp1: '',
        Zeitraum_von_MB1_gp2: '',
        Zeitraum_von_MB1_gp3: '',
        Zeitraum_von_MB1_gp4: '',
        Zeitraum_bis_MB1_gp1: '',
        Zeitraum_bis_MB1_gp2: '',
        Zeitraum_bis_MB1_gp3: '',
        Zeitraum_bis_MB1_gp4: '',
        Leistung_MB1_gp1: '',
        Leistung_MB1_gp2: '',
        Leistung_MB1_gp3: '',
        Leistung_MB1_gp4: '',
        Grundpreis_MB1_gp1: '',
        Grundpreis_MB1_gp2: '',
        Grundpreis_MB1_gp3: '',
        Grundpreis_MB1_gp4: '',
        Total_Grundpreis_MB1: '',
        Total_Grundpreis_MB2: '',
        Abnderungsfaktor_MB1_gp1: '',
        Abnderungsfaktor_MB1_gp2: '',
        Abnderungsfaktor_MB1_gp3: '',
        Abnderungsfaktor_MB1_gp4: '',
        Grundkosten_MB1_gp1: '',
        Grundkosten_MB1_gp2: '',
        Grundkosten_MB1_gp3: '',
        Grundkosten_MB1_gp4: '',
        Total_Grundkosten_MB1: '',        
        KD_E_Mail: '',
        Objektnummer: '',
        Lieferadresse: '',
        Rechnungsdatum: '',
        Ansprechpartner: '',
        ZShlernummer_MB2_p1: '',
        ZShlernummer_MB2_p2: '',
        ZShlernummer_MB2_p3: '',
        ZShlernummer_MB2_p4: '',
        ZShlernummer_MB2_p5: '',
        Zeitraum_von_MB2_p1: '',
        Zeitraum_von_MB2_p2: '',
        Zeitraum_von_MB2_p3: '',
        Zeitraum_von_MB2_p4: '',
        Zeitraum_von_MB2_p5: '',
        Zeitraum_bis_MB2_p1: '',
        Zeitraum_bis_MB2_p2: '',
        Zeitraum_bis_MB2_p3: '',
        Zeitraum_bis_MB2_p4: '',
        Zeitraum_bis_MB2_p5: '',
        ZShlerstand_von_MB2_p1: '',
        ZShlerstand_von_MB2_p2: '',
        ZShlerstand_von_MB2_p3: '',
        ZShlerstand_von_MB2_p4: '',
        ZShlerstand_von_MB2_p5: '',
        ZShlerstand_bis_MB2_p1: '',
        ZShlerstand_bis_MB2_p2: '',
        ZShlerstand_bis_MB2_p3: '',
        ZShlerstand_bis_MB2_p4: '',
        ZShlerstand_bis_MB2_p5: '',
        Verbrauch_in_Verbrauchseinheit_MB2_p1: '',
        Verbrauch_in_Verbrauchseinheit_MB2_p2: '',
        Verbrauch_in_Verbrauchseinheit_MB2_p3: '',
        Verbrauch_in_Verbrauchseinheit_MB2_p4: '',
        Verbrauch_in_Verbrauchseinheit_MB2_p5: '',
        Umrechnungsfaktor_MB2_p1: '',
        Umrechnungsfaktor_MB2_p2: '',
        Umrechnungsfaktor_MB2_p3: '',
        Umrechnungsfaktor_MB2_p4: '',
        Umrechnungsfaktor_MB2_p5: '',
        Verbrauch_in_MWh_MB2_p1: '',
        Verbrauch_in_MWh_MB2_p2: '',
        Verbrauch_in_MWh_MB2_p3: '',
        Verbrauch_in_MWh_MB2_p4: '',
        Verbrauch_in_MWh_MB2_p5: '',
        Zeitraum_von_MB2_ap1: '',
        Zeitraum_von_MB2_ap2: '',
        Zeitraum_von_MB2_ap3: '',
        Zeitraum_von_MB2_ap4: '',
        Zeitraum_bis_MB2_ap1: '',
        Zeitraum_bis_MB2_ap2: '',
        Zeitraum_bis_MB2_ap3: '',
        Zeitraum_bis_MB2_ap4: '',
        Verbrauch_in_MWh_MB1_ap1: '',
        Verbrauch_in_MWh_MB1_ap2: '',
        Verbrauch_in_MWh_MB1_ap3: '',
        Verbrauch_in_MWh_MB1_ap4: '',
        Abrechnungspreis_in_MWh_MB2_ap1: '',
        Abrechnungspreis_in_MWh_MB2_ap2: '',
        Abrechnungspreis_in_MWh_MB2_ap3: '',
        Abrechnungspreis_in_MWh_MB2_ap4: '',
        Total_Verbrauchspreis_MB1: '',
        Anderungsfaktor_MB2_ap1: '',
        Anderungsfaktor_MB2_ap2: '',
        Anderungsfaktor_MB2_ap3: '',
        Anderungsfaktor_MB2_ap4: '',
        Verbrauchskosten_MB2_ap1: '',
        Verbrauchskosten_MB2_ap2: '',
        Verbrauchskosten_MB2_ap3: '',
        Verbrauchskosten_MB2_ap4: '',
        Total_Verbrauchskosten_MB2: '',
        Zeitraum_von_MB2_gp1: '',
        Zeitraum_von_MB2_gp2: '',
        Zeitraum_von_MB2_gp3: '',
        Zeitraum_von_MB2_gp4: '',
        Zeitraum_bis_MB2_gp1: '',
        Zeitraum_bis_MB2_gp2: '',
        Zeitraum_bis_MB2_gp3: '',
        Zeitraum_bis_MB2_gp4: '',
        Leistung_MB2_gp1: '',
        Leistung_MB2_gp2: '',
        Leistung_MB2_gp3: '',
        Leistung_MB2_gp4: '',
        Grundpreis_MB2_gp1: '',
        Grundpreis_MB2_gp2: '',
        Grundpreis_MB2_gp3: '',
        Grundpreis_MB2_gp4: '',
        Anderungsfaktor_MB2_gp1: '',
        Anderungsfaktor_MB2_gp2: '',
        Anderungsfaktor_MB2_gp3: '',
        Anderungsfaktor_MB2_gp4: '',
        Grundkosten_MB2_gp1: '',
        Grundkosten_MB2_gp2: '',
        Grundkosten_MB2_gp3: '',
        Grundkosten_MB2_gp4: '',
        Total_Grundkosten_MB2: '',
        Lieferadresse: '',
        Rechnungsdatum: '',
        Ansprechpartner: '',
        Verbrauch: '',
        Energieentgelte: '',
        Gaspreis_Mittel_Jahr: '',
        Verbrauch_je: '',
        postResults: []
      }
    },
    computed: {
      sortOptions () {
        // Create an options list from our fields
        return this.fields
          .filter(f => f.sortable)
          .map(f => { return { text: f.label, value: f.key } })
      }
    },
    methods: {
      info (item, index, button) {
        // this.modalInfo.title = `Invoice Row No: ${index+1}`
        
        // let invoiceperview = "<h1>This is test.</h1>";
        // this.modalInfo.content = JSON.stringify(item, null, 2)
        // this.$root.$emit('bv::show::modal', 'modalInfo', button)
      },
      resetModal () {
        this.modalInfo.title = ''
        this.modalInfo.content = ''
      },
      onFiltered (filteredItems) {
        // Trigger pagination to update the number of buttons/pages due to filtering
        this.totalRows = filteredItems.length
        this.currentPage = 1
      },
      fetchByDate (startDate, endDate) {
        this.show = true;
        var self = this;
        if (startDate && endDate) {
          fetch( endpointurl+'?_where=(Rechnungsdatum,bw,'+startDate+','+endDate+')',{
            method: 'GET'
          })
          .then(response => response.json())
          .then((responseData) => {
            this.show = false;
            self.items = responseData;
            for(var i=0; i < self.items.length; i++) {
              self.invoicenumber.push(self.items[i].Rechnungsdatensatz);
            }
          })
          .catch(error => {
            this.show = false;
            alert('Record Not Found!!');
          })
        }else{
          this.show = false;
          alert('Please Enter Date Range!!');
        }
      },
      fetchByContractNum (item, index, button) {
        this.show = true;
        let invrec = item.Rechnungsdatensatz;
        fetch( endpointurl+"/"+invrec ,{
          method: 'GET'
        })
        .then(response => response.json())
        .then((invoiceData) => {
          this.show = false;
          this.modalInfo.title = `Rechnungsdatensatz : ${invrec}`
          this.modalInfo.content = invoiceData
          this.$root.$emit('bv::show::modal', 'modalInfo', button)
        })
        .catch(error => {
          this.show = false;
          alert('Record Not Found!!');
        })
      },
      editByContractNum (item, index, button) {
        this.show = true;
        let invrecedit = item.Rechnungsdatensatz;
        fetch( endpointurl+"/"+invrecedit ,{
          method: 'GET'
        })
        .then(response => response.json())
        .then((editinvoiceData) => {
          this.show = false;
          this.EditmodalInfo.title = `Vertragsnummer : ${invrecedit}`
          this.EditmodalInfo.content = editinvoiceData
          this.$root.$emit('bv::show::modal', 'EditmodalInfo', button)
        })
        .catch(error => {
          this.show = false;
          alert('Record Not Found!!');
        })
      },
      generateInvoice (item, button) {
        this.show = true;
        let Rechnungsdatensatz = item.Rechnungsdatensatz;
        fetch('http://localhost:4200/api?invoicenumber='+Rechnungsdatensatz,{
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
          },
        })
        .then(response => response.json())
        .then((invoiceData) => {
          this.show = false;
          // console.log(invoiceData.message)
          if (invoiceData.message == 'success') {
            alert("Invoice has been successfully genetated.");
          }else if(invoiceData.message == 'already'){
            alert("Invoice already genetated.");
          }else if (invoiceData.message == 'pdferror' || invoiceData.message == 'error') {
            alert("Somthing went wrong while generating PDF.");
          }
        })
        .catch(error => {
          this.show = false;
          alert('Invoice PDF Not Found!!');
        })
      },
      generateAllInvoice () {
        var self = this;
        self.show = true;
        var payload = JSON.stringify(invoicenumber);
        axios.post('http://localhost:4200/api/allgenerateinvoice', invoicenumber)
        .then(function (response) {
            self.show = false;
            if(response.status == 200){
                //console.log(response.data);
                if(response.data.success > 0){
                  alert("PDF successfully generated.");
                }else if(response.data.already > 0){
                  alert("PDF already generated.");
                }else{
                  alert("Somthing went wrong while generating PDF.");
                }
            }
            else{
              self.show = false;
              alert("Somthing went wrong while generating PDF.");
            }
        })
        .catch(function (error) {
            self.show = false;
            alert("Somthing went wrong while generating PDF.");
        });
      },
      updateInvociem (Rechnungsdatensatz_Id, button) {
        this.postResults = {}
        var self = this;
        self.show = true;
        var myrcinput = document.getElementsByTagName('input');
        for (var i = 0; i < myrcinput.length; i += 1) {
          if (myrcinput[i].name != '') {
            this.postResults[myrcinput[i].name] = myrcinput[i].value;
          }
        }
        this.postResults.Queue = "";
        var apiBaseUrl = endpointurl+"/"+Rechnungsdatensatz_Id;
        fetch(apiBaseUrl , {
            method: 'PATCH',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.postResults)
        }).then(function(response) {
            self.show = false;
            // console.log(response);
            if(response.status == 200){
                alert("Invoice successfully updated.");
            }
            else{
                alert("Somthing went wrong while updating invoice.");
            }
        }).catch(function (error) {
            self.show = false;
            alert("Somthing went wrong while creatiing invoice.");
        });
      }
    }
  }
</script>

<style>
  @import './assets/styles/style.scss';
  @import './css/icons-codes.css';

  address p{
    margin: 0 0 0.25em;
  }
  *[contenteditable]:hover, *[contenteditable]:focus, td:hover *[contenteditable], td:focus *[contenteditable], img.hover, input:hover, input:focus {
      background: #DEF;
      box-shadow: 0 0 1em 0.5em #DEF;
  }
  .utility-bill-container {
      width: 100%;
      max-width: 1126px;
      margin: 0 auto;
  }
  address input {
    font-family: energicos-regular;
    font-size: 13px;
    margin:0 0 0.25em;
  }
  input {
      border: 0px;
      border-radius: 0px;
      color:rgb(102, 102, 102);
      letter-spacing:0.75px;
  }
  ul input{
    text-align:center;
  }
</style>