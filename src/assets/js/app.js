(function($){
  $(document).foundation();

  'use strict';

  $('[data-open="formModal"]').click(function(e){
    e.preventDefault();
  });
}(jQuery));

var searchIndex;

function search() {
  var searchText = $("#search").val();

  $(".project-tile").each(function(obj) {
    $(obj).data("score", $(obj).data("id"));
  });

  if(searchText.replace(/ /g,'') == "" ) {
    $('#project-list').isotope({ filter: '*' });
    return;
  }

  var results = searchIndex.search(searchText);
  for(var i = 0; i < results.length; i++) {
    var res = results[i];
    $('*[data-id="' + res.ref + '"]').data('score', res.score);
  }

  $('#project-list').isotope('updateSortData').isotope();

  $('#project-list').isotope({
    sortBy: 'weight',
    filter: function() {
      var id = parseInt($(this).data("id"));

      for(var i = 0; i < results.length; i++) {
        if(results[i].ref == id)
          return true;
      }

      return false;
    }
  });
}

function categoryFilter(text) {
  $('#search').val(text);

  $(".project-tile").each(function(obj) {
    $(obj).data("score", $(obj).data("id"));
  });

  $('#project-list').isotope('updateSortData').isotope();

  $('#project-list').isotope({
    sortBy: 'weight',
    filter: function() {
      return $(this).data("category") == text;
    }
  });
}

function populateProjects(data) {
  searchIndex = lunr(function () {
    this.field('name', { boost: 10 });
    this.field('solutionStatement', { boost: 7 });
    this.field('category', { boost: 5 });
    this.field('location', { boost: 5 });
    this.field('problemStatement', { boost: 5 });
    this.field('category', { boost: 5 });
    this.field('parentOrganization');
    this.field('additionalInformation');
    this.field('category');
    this.field('tags');
    this.ref('id');
  });

  var source   = $("#project-template").html();
  var template = Handlebars.compile(source);

  var categories = {};
  var tags = {};

  for(project of data) {
    var html = template(project);
    $("#project-list").append(html);
    searchIndex.add(project);
    categories[project.category] = "";
    $.each(project.tags, function(i, tag) { tags[tag] = "" });
    $.merge(tags, project.tags);
  }

  categories = Object.keys(categories);
  tags = Object.keys(tags);

  $.each(categories, function(i, category) {
    var side = i < (Math.floor(categories.length / 2)) ? 0 : 1;
    var list = $('#categories').find('ul')[side];

    $(list).append("<li><a class='category-search' href='#'>" + category + "</a></li>");
  });

  $('.category-search').click(function() { categoryFilter($(this).text()); });

  $('#project-list').isotope({
    itemSelector: '.project-tile',
    sortAscending: false,
    layoutMode: 'fitRows',
    layoutMode: 'vertical',
    getSortData: {
      weight: function( itemElem ) {
        return parseFloat( $( itemElem ).data("score") ) * 100;
      }
    }
  });
}

function normalizeHeaders(element) {
  element["id"] = element["rowNumber"];
  element["addedAt"] = Date.parse( element["timestamp"] );
  element["authorName"] = element["whatisyourfullname"];
  element["authorEmail"] = element["whatisyouremailaddress"];
  element["name"] = element["whatisthenameoftheproject"];
  element["url"] = element["whatistheprojectswebsiteifapplicable"];
  element["location"] = element["whereisthisprojectlocated"];
  element["problemStatement"] = element["whatistheproblemthatthisprojectsolves"];
  element["solutionStatement"] = element["whatisthisprojectssolution"];
  element["isFundraising"] = coerceToBool(element["doyouknowifthisprojectiscurrentlyfundraising"]);
  element["isContactInformationAvailable"] = coerceToBool(element["doyouknowofanycontactinformationforthisproject"]);
  element["category"] = element["whichcategorybestdescribesthisproject"];
  element["tags"] = String(element["whichtagsbestdescribethisproject"]).split(", ");
  element["twitterUrl"] = element["ifthisprojecthasatwitterprofilewhatistheurl"];
  element["isSubOrganization"] = coerceToBool(element["istheprojectapartofabiggerorganization"]);
  element["isAdditionalDetails"] = coerceToBool(element["isthereanyadditionalinformationyoudliketoprovide"]);
  element["facebookUrl"] = element["ifthisprojecthasafacebookpagewhatistheurl"];
  element["needsVolunteers"] = coerceToBool(element["doyouknowifthisprojectneedsvolunteers"]);
  element["nameAndEmailProvided"] = coerceToBool(element["wouldyouliketoprovideuswithyournameandemailaddress"]);
  element["hasSocialMedia"] = coerceToBool(element["doyouknowifthisprojecthasanysocialmediaaccounts"]);
  element["linkedinUrl"] = element["ifthisprojecthasalinkedinpagewhatistheurl"];
  element["additionalInformation"] = element["whatistheadditionalinformationyoudliketoprovide"];
  element["donationStatement"] = element["whatisthebestwaytodonatetotheproject"];
  element["donationMethod"] = element["whatisthecategoryofthedonationmethodyouprovidedabove"];
  element["bestContactMethod"] = element["whatisthebestwaytocontacttheproject"];
  element["contactCategory"] = element["whatisthecategorythatdescribesthecontactinformationyouprovidedabove"];
  element["volunteerType"] = element["whatkindofvolunteersdoesthisprojectneed"];
  element["parentOrganization"] = element["whatisthenameoftheorganizationwhichrunstheproject"];

  delete element["timestamp"];
  delete element["whatisyourfullname"];
  delete element["whatisyouremailaddress"];
  delete element["whatisthenameoftheproject"];
  delete element["whatistheprojectswebsiteifapplicable"];
  delete element["whereisthisprojectlocated"];
  delete element["whatistheproblemthatthisprojectsolves"];
  delete element["whatisthisprojectssolution"];
  delete element["doyouknowifthisprojectiscurrentlyfundraising"];
  delete element["doyouknowofanycontactinformationforthisproject"];
  delete element["whichcategorybestdescribesthisproject"];
  delete element["whichtagsbestdescribethisproject"];
  delete element["ifthisprojecthasatwitterprofilewhatistheurl"];
  delete element["istheprojectapartofabiggerorganization"];
  delete element["isthereanyadditionalinformationyoudliketoprovide"];
  delete element["ifthisprojecthasafacebookpagewhatistheurl"];
  delete element["doyouknowifthisprojectneedsvolunteers"];
  delete element["wouldyouliketoprovideuswithyournameandemailaddress"];
  delete element["doyouknowifthisprojecthasanysocialmediaaccounts"];
  delete element["ifthisprojecthasalinkedinpagewhatistheurl"];
  delete element["whatistheadditionalinformationyoudliketoprovide"];
  delete element["whatisthebestwaytodonatetotheproject"];
  delete element["whatisthecategoryofthedonationmethodyouprovidedabove"];
  delete element["whatisthebestwaytocontacttheproject"];
  delete element["whatisthecategorythatdescribesthecontactinformationyouprovidedabove"];
  delete element["whatkindofvolunteersdoesthisprojectneed"];
  delete element["whatisthenameoftheorganizationwhichrunstheproject"];
}

function coerceToBool(obj) {
  return String(obj).toLowerCase() == "yes";
}

$(function() {
  Tabletop.init( {
    key: '1wYKZMMBerbWGFvwsOtra5jKt02IMwAwQDxWBurHTbSQ',
    simpleSheet: true,
    prettyColumnNames: false,
    postProcess: normalizeHeaders,
    callback: populateProjects
  });

  $("#search").on('input', search);
});
