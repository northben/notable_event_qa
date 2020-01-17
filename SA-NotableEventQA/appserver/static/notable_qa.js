var submitType = "";

require([
  'underscore',
  'jquery',
  'splunkjs/mvc',
  'splunkjs/mvc/tableview',
  'splunkjs/mvc/searchmanager',
  'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView, SearchManager) {

  var notable_list = splunkjs.mvc.Components.get("notable_list");
  var tokens = mvc.Components.get("default");

  notable_list.on("click", function(f) {
    f.preventDefault();

    if(f.data['row.satisfaction'] === null) {
      submitType = "new"
    }
    else {
      submitType = "update"
    }
  })

  $("#submit_feedback").addClass("btn btn-primary").click(function() {
    console.log("clicked the button!");
    if (submitType == "new") {
      postNewEntry()
    }
    else {
      updateExistingRecord()
    }
  })

  function postNewEntry() {
      var record = {
          _time: (new Date).getTime() / 1000,
          satisfaction: tokens.attributes.satisfaction,
          comments: tokens.attributes.comments,
          _key: tokens.attributes.key,
          user: Splunk.util.getConfigValue("USERNAME")
      }

      $.ajax({
          url: '/en-US/splunkd/__raw/servicesNS/nobody/SA-NotableEventQA/storage/collections/data/notable_qa',
          type: 'POST',
          contentType: "application/json",
          async: true,
          data: JSON.stringify(record),
          success: function(returneddata) { newkey = returneddata }
      })
  }

  function updateExistingRecord(record) {
      var record = {
          _time: (new Date).getTime() / 1000,
          satisfaction: tokens.attributes.satisfaction,
          comments: tokens.attributes.comments,
          user: Splunk.util.getConfigValue("USERNAME")
      }

      $.ajax({
          url: '/en-US/splunkd/__raw/servicesNS/nobody/SA-NotableEventQA/storage/collections/data/notable_qa/' + tokens.attributes.key,
          type: "POST",
          async: true,
          contentType: "application/json",
          data: JSON.stringify(record),
          success: function(returneddata) {
              console.log("Updated!", returneddata)
          },
          error: function(xhr, textStatus, error) {
              console.error("Error Updating!", xhr, textStatus, error);
              $.ajax({
                  url: '/en-US/splunkd/__raw/servicesNS/nobody/SA-NotableEventQA/storage/collections/data/notable_qa/' + collection,
                  type: "POST",
                  async: true,
                  contentType: "application/json",
                  data: JSON.stringify(record),
                  success: function(returneddata) {
                      console.log("Added!", returneddata)
                  },
                  error: function(xhr, textStatus, error) {
                      console.error("Error Adding!", xhr, textStatus, error);
                  }
              });
          }
      });
  }
})
