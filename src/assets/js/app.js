var searchIndex;

function search(searchText) {
  console.log('searched');
  $(".project-tile").each(function(obj) {
    $(obj).data("score", $(obj).data("id"));
  });

  if(searchText.replace(/ /g,'') == "" ) {
    $('#project-list').isotope({ filter: '*' });
    mixpanel.track("search", { "action" : "reset", "query" : null });
    return;
  }

  var results = searchIndex.search(searchText);
  mixpanel.track("search", { "action" : "search", "query" : searchText, "result_count" : results.length });

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

  mixpanel.track("search", { "action" : "category-filter", "category" : text });

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
  // Removes HXL markup at top of spreadsheet
  delete data[0];
  searchIndex = lunr(function () {
    this.field('projectname', { boost: 15 });
    this.field('website', { boost: 10 });
    this.field('solution', { boost: 7 });
    this.field('organizationname', { boost: 5 });
    this.field('address', { boost: 5 });
    this.field('country', { boost: 5 });
    this.field('problem', { boost: 5 });
    this.field('category', { boost: 5 });
    this.field('tags', { boost: 3 });
    this.field('additionalinfo');
    this.field('additionalcountries');
    this.field('citytowns');
    this.field('contactinfo');
    this.field('country');
    this.field('donateinfo');
    this.field('englishname');
    this.field('facebookurl');
    this.field('instagramurl');
    this.field('languages');
    this.field('linkedinurl');
    this.field('organizationtype');
    this.field('sourcedataset');
    this.field('twitterurl');
    this.field('volunteerneeds');
  });

  var source   = $("#project-template").html();
  var template = Handlebars.compile(source);

  var categories = {};
  var tags = {};

  data.forEach(function(project) {
    var html = template(project);
    $("#project-list").append(html);
    searchIndex.add(project);
    categories[project.category] = "";
    // $.each(project.tags, function(i, tag) { tags[tag] = "" });
    // $.merge(tags, project.tags);
  });

  categories = Object.keys(categories);
  // tags = Object.keys(tags);
  //
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

  $(".project-tile").each(function(i, tile) {
    $(tile).find('a').click(function(e) {
      console.log(e.target.href);
      mixpanel.track("clicked", {
        "target" : e.currentTarget.href,
        "text" : e.currentTarget.text,
        "type" : $(e.currentTarget).data("type"),
        "project_id" : $(tile).data("id"),
        "project_category" : $(tile).data("category"),
        "project_tags" : $(tile).data("tags")
      });
    });
  });
}

function coerceToBool(obj) {
  return String(obj).toLowerCase() == 'yes';
}

function truncate(text, maxLength) {
  var ret = text;
  if (ret.length > maxLength) {
    ret = ret.substr(0,maxLength-3) + "...";
  }
  return ret;
}

function prepData(element) {
  element['id'] = element['rowNumber'];
  delete element['addedbyname'];
  delete element['addedbyemail'];
  delete element['timestamp'];
  coerceToBool(element['fundraising']);
  coerceToBool(element['volunteers']);
  element['solution'] = truncate(element['solution'], 175);
  element['website'] = truncate(element['website'], 60);
  element['projectname'] = truncate(element['projectname'], 50);
  element['organizationname'] = truncate(element['organizationname'], 50);
}

$(function() {
  Tabletop.init( {
    key: '1V3BUANVaLhPmoQAQOdrHebCH4_KzyJnjY99M04AMazE',
    simpleSheet: true,
    prettyColumnNames: false,
    postProcess: prepData,
    callback: populateProjects
  });

  var timer;
  
  // Call the search function when the user stops typing, with 300ms delay
  $('#search').keyup(function() {
    var searchText = $(this).val();

    clearTimeout(timer);

    if (searchText) {
      timer = setTimeout(function() {
        console.log('set the timeout');
        search(searchText);
      }, 300);
    }

  });

});

mixpanel.track("loaded");
