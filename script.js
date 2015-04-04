$(document).ready(function() {

    var blacklist_failure = false;
    var blacklist_groups = [];

    var pickRandom = function(list, blacklist) {
        if (blacklist === undefined) {
            blacklist = [];
        }
        
        var listCopy = list.filter(function(el) {
            return blacklist.indexOf(el) < 0;
        });

        if (listCopy.length < 1 && list.length > 0) {
            blacklist_failure = true;
        }

        var indexCopy = Math.floor(Math.random() * listCopy.length);
        var elementCopy = listCopy[indexCopy];

        var index = list.indexOf(elementCopy);
        var result = list.splice(index, 1);
        return result;
    }

    var buildBlacklist = function(group, blacklist_groups) {
        var result = [];
        group.forEach(function(member) {
            if (blacklist_groups[member] && blacklist_groups[member].length > 0) {
                result = result.concat(blacklist_groups[member]);
            }
        });
        return result;
    }

    var processBlackListGroups = function(blacklist_groups) {
        for (var key in blacklist_groups) {
            var list = blacklist_groups[key];
            for (var i in list) {
                if (blacklist_groups[list[i]] === undefined) {
                    blacklist_groups[list[i]] = [key];
                } else {
                    blacklist_groups[list[i]].push(key);
                }
            }
        }
    }

    var pickPeople = function(list, count) {
        var result = [];
        for (var i = 0; i < count; i++) {
            var blacklist = buildBlacklist(result, blacklist_groups);
            var picked = pickRandom(list, blacklist);
            result = result.concat(picked);
        }
        return result;
    }

    var printGroup = function(name, group) {
        var result = name + '\n';
        group.forEach(function(member) {
            result += '\t' + member + '\n';
        });
        return result;
    }

    var pickFromGroups = function(groups, minGroupSize, local_blacklist) {
        for (var i = groups.length - 1; i >= 0; i--) {
            var group = groups[i];
            if (group.length > minGroupSize) {
                var blacklist = buildBlacklist(local_blacklist, blacklist_groups);
                return pickRandom(group, blacklist)[0];
            } 
        }
    }

    var filter = function(groups) {
        var noOneManGroups = $('[name="no_one_man_groups_allowed"]').prop("checked")
        if (noOneManGroups) {
            groups.forEach(function(group) {
                if (group.length < 2) {
                    var person = pickFromGroups(groups, 2, group);
                    group.push(person);
                }
            });
        }
    }

    var do_generate = function() {
        var taInput = jQuery('textarea#taInput');
        var taOutput = jQuery('textarea#taOutput')
        var personList = taInput.val().split('\n');
        var groupSize = parseInt($('[name="group_size"]').prop("value"), 10);
        var group = [];
        var groups = [];

        blacklist_groups = $('[name="group_blacklist"]').val();
        localStorage.setItem("group_blacklist", blacklist_groups);
        if (blacklist_groups.length == 0) {
            blacklist_groups = [];
        } else {
            blacklist_groups = JSON.parse(blacklist_groups);
        }
        processBlackListGroups(blacklist_groups);

        do {
            group = pickPeople(personList, groupSize);
            if (group.length > 0) {
                groups.push(group);
            }
        } while (group.length > 0);

        filter(groups);

        var i = 1;
        var groupList = "";
        var groupPrefix = $('[name="group_prefix"]').prop("value");
        groups.forEach(function(group) {
            groupList += printGroup(groupPrefix + " " + i, group);
            i++;
        });

        taOutput.text(groupList);
    };

    var generate = function() {
        var i = 0;
        do {
            blacklist_failure = false;
            do_generate();
            i++;
        } while (blacklist_failure == true && i < 100);
        
        if (blacklist_failure) {
            alert("Error: Blacklist ignored after 100 attempts to satisfy it");
        }
    };


    window.generate = generate;

    $("#option_box").accordion({
        collapsible: true
    });

    $("#option_box").accordion({
        active: false
    });

    blacklist_groups = $('[name="group_blacklist"]').val();

    if (blacklist_groups.length == 0) {
        blacklist_groups = localStorage.getItem("group_blacklist");
        $('[name="group_blacklist"]').val(blacklist_groups);        
    }

});