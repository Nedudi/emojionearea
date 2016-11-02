/*!
 * EmojioneArea v3.1.5
 * https://github.com/mervick/emojionearea
 * Copyright Andrey Izman and other contributors
 * Released under the MIT license
 * Date: 2016-11-02T16:04Z
 */
(function(document, window, $) {
    'use strict';

    var unique = 0;
    var eventStorage = {};
    var possibleEvents = {};
    var emojione = window.emojione;
    var readyCallbacks = [];
    function emojioneReady (fn) {
        if (emojione) {
            fn();
        } else {
            readyCallbacks.push(fn);
        }
    };
    var blankImg = 'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw==';
    var slice = [].slice;
    var css_class = "emojionearea";
    var emojioneSupportMode = 0;
    var invisibleChar = '&#8203;';
    function trigger(self, event, args) {
        var result = true, j = 1;
        if (event) {
            event = event.toLowerCase();
            do {
                var _event = j==1 ? '@' + event : event;
                if (eventStorage[self.id][_event] && eventStorage[self.id][_event].length) {
                    $.each(eventStorage[self.id][_event], function (i, fn) {
                        return result = fn.apply(self, args|| []) !== false;
                    });
                }
            } while (result && !!j--);
        }
        return result;
    }
    function attach(self, element, events, target) {
        target = target || function (event, callerEvent) { return $(callerEvent.currentTarget) };
        $.each(events, function(event, link) {
            event = $.isArray(events) ? link : event;
            (possibleEvents[self.id][link] || (possibleEvents[self.id][link] = []))
                .push([element, event, target]);
        });
    }
    function getTemplate(template, unicode, shortname) {
        var imageType = emojione.imageType, imagePath;
        if (imageType=='svg'){
            imagePath = emojione.imagePathSVG;
        } else {
            imagePath = emojione.imagePathPNG;
        }
        return template
            .replace('{name}', shortname || '')
            .replace('{img}', imagePath + (emojioneSupportMode < 2 ? unicode.toUpperCase() : unicode) + '.' + imageType)
            .replace('{uni}', unicode)
            .replace('{alt}', emojione.convert(unicode));
    };
    function shortnameTo(str, template, clear) {
        return str.replace(/:?\+?[\w_\-]+:?/g, function(shortname) {
            shortname = ":" + shortname.replace(/:$/,'').replace(/^:/,'') + ":";
            var unicode = emojione.emojioneList[shortname];
            if (unicode) {
                if (emojioneSupportMode > 3) unicode = unicode.unicode;
                return getTemplate(template, unicode[unicode.length-1], shortname);
            }
            return clear ? '' : shortname;
        });
    };
    function pasteHtmlAtCaret(html) {
        var sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ( (node = el.firstChild) ) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type != "Control") {
            document.selection.createRange().pasteHTML(html);
        }
    }
    var getDefaultOptions = function () {
        return $.fn.emojioneArea && $.fn.emojioneArea.defaults ? $.fn.emojioneArea.defaults : {
            attributes: {
                dir               : "ltr",
                spellcheck        : false,
                autocomplete      : "off",
                autocorrect       : "off",
                autocapitalize    : "off",
            },
            placeholder       : null,
            emojiPlaceholder  : ":smiley:",
            container         : null,
            hideSource        : true,
            shortnames        : true,
            sprite            : true,
            pickerPosition    : "top", // top | bottom | right
            filtersPosition   : "top", // top | bottom
            hidePickerOnBlur  : true,
            buttonTitle       : "Use the TAB key to insert emoji faster",
            tones             : true,
            tonesStyle        : "bullet", // bullet | radio | square | checkbox
            inline            : null, // null - auto
            saveEmojisAs      : "unicode", // unicode | shortname | image
            shortcuts         : true,
            autocomplete      : true,
            autocompleteTones : false,
            standalone        : false,
            useInternalCDN    : true, // Use the self loading mechanism
            imageType         : "png", // Default image type used by internal CDN
            recentEmojis      : true,
            textcomplete: {
                maxCount      : 15,
                placement     : null // null - default | top | absleft | absright
            },

            filters: {
                tones: {
                    title: "Diversity",
                    emoji: "santa runner surfer swimmer lifter ear nose point_up_2 point_down point_left point_right punch " +
                    "wave ok_hand thumbsup thumbsdown clap open_hands boy girl man woman cop bride_with_veil person_with_blond_hair " +
                    "man_with_gua_pi_mao man_with_turban older_man grandma baby construction_worker princess angel " +
                    "information_desk_person guardsman dancer nail_care massage haircut muscle spy hand_splayed middle_finger " +
                    "vulcan no_good ok_woman bow raising_hand raised_hands person_frowning person_with_pouting_face pray rowboat " +
                    "bicyclist mountain_bicyclist walking bath metal point_up basketball_player fist raised_hand v writing_hand"
                },

                recent: {
                    icon: "clock3",
                    title: "Recent",
                    emoji: ""
                },

                smileys_people: {
                    icon: "yum",
                    title: "Smileys & People",
                    emoji: "grinning grimacing grin joy smiley smile sweat_smile laughing innocent wink blush slight_smile " +
                    "upside_down relaxed yum relieved heart_eyes kissing_heart kissing kissing_smiling_eyes " +
                    "kissing_closed_eyes stuck_out_tongue_winking_eye stuck_out_tongue_closed_eyes stuck_out_tongue " +
                    "money_mouth nerd sunglasses hugging smirk no_mouth neutral_face expressionless unamused rolling_eyes " +
                    "thinking flushed disappointed worried angry rage pensive confused slight_frown frowning2 persevere " +
                    "confounded tired_face weary triumph open_mouth scream fearful cold_sweat hushed frowning anguished " +
                    "cry disappointed_relieved sleepy sweat sob dizzy_face astonished zipper_mouth mask thermometer_face " +
                    "head_bandage sleeping zzz poop smiling_imp imp japanese_ogre japanese_goblin skull ghost alien robot " +
                    "smiley_cat smile_cat joy_cat heart_eyes_cat smirk_cat kissing_cat scream_cat crying_cat_face " +
                    "pouting_cat raised_hands clap wave thumbsup thumbsdown punch fist v ok_hand raised_hand open_hands " +
                    "muscle pray point_up point_up_2 point_down point_left point_right middle_finger hand_splayed metal " +
                    "vulcan writing_hand nail_care lips tongue ear nose eye eyes bust_in_silhouette busts_in_silhouette " +
                    "speaking_head baby boy girl man woman person_with_blond_hair older_man older_woman man_with_gua_pi_mao " +
                    "man_with_turban cop construction_worker guardsman spy santa angel princess bride_with_veil walking " +
                    "runner dancer dancers couple two_men_holding_hands two_women_holding_hands bow information_desk_person " +
                    "no_good ok_woman raising_hand person_with_pouting_face person_frowning haircut massage couple_with_heart " +
                    "couple_ww couple_mm couplekiss kiss_ww kiss_mm family family_mwg family_mwgb family_mwbb family_mwgg " +
                    "family_wwb family_wwg family_wwgb family_wwbb family_wwgg family_mmb family_mmg family_mmgb family_mmbb " +
                    "family_mmgg womans_clothes shirt jeans necktie dress bikini kimono lipstick kiss footprints high_heel " +
                    "sandal boot mans_shoe athletic_shoe womans_hat tophat helmet_with_cross mortar_board crown school_satchel " +
                    "pouch purse handbag briefcase eyeglasses dark_sunglasses ring closed_umbrella"
                },

                animals_nature: {
                    icon: "hamster",
                    title: "Animals & Nature",
                    emoji: "dog cat mouse hamster rabbit bear panda_face koala tiger lion_face cow pig pig_nose frog " +
                    "octopus monkey_face see_no_evil hear_no_evil speak_no_evil monkey chicken penguin bird baby_chick " +
                    "hatching_chick hatched_chick wolf boar horse unicorn bee bug snail beetle ant spider scorpion crab " +
                    "snake turtle tropical_fish fish blowfish dolphin whale whale2 crocodile leopard tiger2 water_buffalo " +
                    "ox cow2 dromedary_camel camel elephant goat ram sheep racehorse pig2 rat mouse2 rooster turkey dove " +
                    "dog2 poodle cat2 rabbit2 chipmunk feet dragon dragon_face cactus christmas_tree evergreen_tree " +
                    "deciduous_tree palm_tree seedling herb shamrock four_leaf_clover bamboo tanabata_tree leaves " +
                    "fallen_leaf maple_leaf ear_of_rice hibiscus sunflower rose tulip blossom cherry_blossom bouquet " +
                    "mushroom chestnut jack_o_lantern shell spider_web earth_americas earth_africa earth_asia full_moon " +
                    "waning_gibbous_moon last_quarter_moon waning_crescent_moon new_moon waxing_crescent_moon " +
                    "first_quarter_moon waxing_gibbous_moon new_moon_with_face full_moon_with_face first_quarter_moon_with_face " +
                    "last_quarter_moon_with_face sun_with_face crescent_moon star star2 dizzy sparkles comet sunny " +
                    "white_sun_small_cloud partly_sunny white_sun_cloud white_sun_rain_cloud cloud cloud_rain " +
                    "thunder_cloud_rain cloud_lightning zap fire boom snowflake cloud_snow snowman2 snowman wind_blowing_face " +
                    "dash cloud_tornado fog umbrella2 umbrella droplet sweat_drops ocean"
                },

                food_drink: {
                    icon: "pizza",
                    title: "Food & Drink",
                    emoji: "green_apple apple pear tangerine lemon banana watermelon grapes strawberry melon cherries peach " +
                    "pineapple tomato eggplant hot_pepper corn sweet_potato honey_pot bread cheese poultry_leg meat_on_bone " +
                    "fried_shrimp egg hamburger fries hotdog pizza spaghetti taco burrito ramen stew fish_cake sushi bento " +
                    "curry rice_ball rice rice_cracker oden dango shaved_ice ice_cream icecream cake birthday custard candy " +
                    "lollipop chocolate_bar popcorn doughnut cookie beer beers wine_glass cocktail tropical_drink champagne " +
                    "sake tea coffee baby_bottle fork_and_knife fork_knife_plate"
                },

                activity: {
                    icon: "basketball",
                    title: "Activity",
                    emoji: "soccer basketball football baseball tennis volleyball rugby_football 8ball golf golfer ping_pong " +
                    "badminton hockey field_hockey cricket ski skier snowboarder ice_skate bow_and_arrow fishing_pole_and_fish " +
                    "rowboat swimmer surfer bath basketball_player lifter bicyclist mountain_bicyclist horse_racing levitate " +
                    "trophy running_shirt_with_sash medal military_medal reminder_ribbon rosette ticket tickets performing_arts " +
                    "art circus_tent microphone headphones musical_score musical_keyboard saxophone trumpet guitar violin " +
                    "clapper video_game space_invader dart game_die slot_machine bowling"
                },

                travel_places: {
                    icon: "rocket",
                    title: "Travel & Places",
                    emoji: "red_car taxi blue_car bus trolleybus race_car police_car ambulance fire_engine minibus truck " +
                    "articulated_lorry tractor motorcycle bike rotating_light oncoming_police_car oncoming_bus " +
                    "oncoming_automobile oncoming_taxi aerial_tramway mountain_cableway suspension_railway railway_car " +
                    "train monorail bullettrain_side bullettrain_front light_rail mountain_railway steam_locomotive train2 " +
                    "metro tram station helicopter airplane_small airplane airplane_departure airplane_arriving sailboat " +
                    "motorboat speedboat ferry cruise_ship rocket satellite_orbital seat anchor construction fuelpump busstop " +
                    "vertical_traffic_light traffic_light checkered_flag ship ferris_wheel roller_coaster carousel_horse " +
                    "construction_site foggy tokyo_tower factory fountain rice_scene mountain mountain_snow mount_fuji volcano " +
                    "japan camping tent park motorway railway_track sunrise sunrise_over_mountains desert beach island " +
                    "city_sunset city_dusk cityscape night_with_stars bridge_at_night milky_way stars sparkler fireworks " +
                    "rainbow homes european_castle japanese_castle stadium statue_of_liberty house house_with_garden " +
                    "house_abandoned office department_store post_office european_post_office hospital bank hotel " +
                    "convenience_store school love_hotel wedding classical_building church mosque synagogue kaaba shinto_shrine"
                },

                objects: {
                    icon: "bulb",
                    title: "Objects",
                    emoji: "watch iphone calling computer keyboard desktop printer mouse_three_button trackball joystick " +
                    "compression minidisc floppy_disk cd dvd vhs camera camera_with_flash video_camera movie_camera projector " +
                    "film_frames telephone_receiver telephone pager fax tv radio microphone2 level_slider control_knobs " +
                    "stopwatch timer alarm_clock clock hourglass_flowing_sand hourglass satellite battery electric_plug bulb " +
                    "flashlight candle wastebasket oil money_with_wings dollar yen euro pound moneybag credit_card gem scales " +
                    "wrench hammer hammer_pick tools pick nut_and_bolt gear chains gun bomb knife dagger crossed_swords shield " +
                    "smoking skull_crossbones coffin urn amphora crystal_ball prayer_beads barber alembic telescope microscope " +
                    "hole pill syringe thermometer label bookmark toilet shower bathtub key key2 couch sleeping_accommodation " +
                    "bed door bellhop frame_photo map beach_umbrella moyai shopping_bags balloon flags ribbon gift confetti_ball " +
                    "tada dolls wind_chime crossed_flags izakaya_lantern envelope envelope_with_arrow incoming_envelope e-mail " +
                    "love_letter postbox mailbox_closed mailbox mailbox_with_mail mailbox_with_no_mail package postal_horn " +
                    "inbox_tray outbox_tray scroll page_with_curl bookmark_tabs bar_chart chart_with_upwards_trend " +
                    "chart_with_downwards_trend page_facing_up date calendar calendar_spiral card_index card_box ballot_box " +
                    "file_cabinet clipboard notepad_spiral file_folder open_file_folder dividers newspaper2 newspaper notebook " +
                    "closed_book green_book blue_book orange_book notebook_with_decorative_cover ledger books book link " +
                    "paperclip paperclips scissors triangular_ruler straight_ruler pushpin round_pushpin triangular_flag_on_post " +
                    "flag_white flag_black closed_lock_with_key lock unlock lock_with_ink_pen pen_ballpoint pen_fountain " +
                    "black_nib pencil pencil2 crayon paintbrush mag mag_right"
                },

                symbols: {
                    icon: "heartpulse",
                    title: "Symbols",
                    emoji: "heart yellow_heart green_heart blue_heart purple_heart broken_heart heart_exclamation two_hearts " +
                    "revolving_hearts heartbeat heartpulse sparkling_heart cupid gift_heart heart_decoration peace cross " +
                    "star_and_crescent om_symbol wheel_of_dharma star_of_david six_pointed_star menorah yin_yang orthodox_cross " +
                    "place_of_worship ophiuchus aries taurus gemini cancer leo virgo libra scorpius sagittarius capricorn " +
                    "aquarius pisces id atom u7a7a u5272 radioactive biohazard mobile_phone_off vibration_mode u6709 u7121 " +
                    "u7533 u55b6 u6708 eight_pointed_black_star vs accept white_flower ideograph_advantage secret congratulations " +
                    "u5408 u6e80 u7981 a b ab cl o2 sos no_entry name_badge no_entry_sign x o anger hotsprings no_pedestrians " +
                    "do_not_litter no_bicycles non-potable_water underage no_mobile_phones exclamation grey_exclamation question " +
                    "grey_question bangbang interrobang 100 low_brightness high_brightness trident fleur-de-lis part_alternation_mark " +
                    "warning children_crossing beginner recycle u6307 chart sparkle eight_spoked_asterisk negative_squared_cross_mark " +
                    "white_check_mark diamond_shape_with_a_dot_inside cyclone loop globe_with_meridians m atm sa passport_control " +
                    "customs baggage_claim left_luggage wheelchair no_smoking wc parking potable_water mens womens baby_symbol " +
                    "restroom put_litter_in_its_place cinema signal_strength koko ng ok up cool new free zero one two three four " +
                    "five six seven eight nine ten 1234 arrow_forward pause_button play_pause stop_button record_button track_next " +
                    "track_previous fast_forward rewind twisted_rightwards_arrows repeat repeat_one arrow_backward arrow_up_small " +
                    "arrow_down_small arrow_double_up arrow_double_down arrow_right arrow_left arrow_up arrow_down arrow_upper_right " +
                    "arrow_lower_right arrow_lower_left arrow_upper_left arrow_up_down left_right_arrow arrows_counterclockwise " +
                    "arrow_right_hook leftwards_arrow_with_hook arrow_heading_up arrow_heading_down hash asterisk information_source " +
                    "abc abcd capital_abcd symbols musical_note notes wavy_dash curly_loop heavy_check_mark arrows_clockwise " +
                    "heavy_plus_sign heavy_minus_sign heavy_division_sign heavy_multiplication_x heavy_dollar_sign currency_exchange " +
                    "copyright registered tm end back on top soon ballot_box_with_check radio_button white_circle black_circle " +
                    "red_circle large_blue_circle small_orange_diamond small_blue_diamond large_orange_diamond large_blue_diamond " +
                    "small_red_triangle black_small_square white_small_square black_large_square white_large_square small_red_triangle_down " +
                    "black_medium_square white_medium_square black_medium_small_square white_medium_small_square black_square_button " +
                    "white_square_button speaker sound loud_sound mute mega loudspeaker bell no_bell black_joker mahjong spades " +
                    "clubs hearts diamonds flower_playing_cards thought_balloon anger_right speech_balloon clock1 clock2 clock3 " +
                    "clock4 clock5 clock6 clock7 clock8 clock9 clock10 clock11 clock12 clock130 clock230 clock330 clock430 " +
                    "clock530 clock630 clock730 clock830 clock930 clock1030 clock1130 clock1230 eye_in_speech_bubble"
                },

                flags: {
                    icon: "flag_gb",
                    title: "Flags",
                    emoji: "ac af al dz ad ao ai ag ar am aw au at az bs bh bd bb by be bz bj bm bt bo ba bw br bn bg bf bi " +
                    "cv kh cm ca ky cf td flag_cl cn co km cg flag_cd cr hr cu cy cz dk dj dm do ec eg sv gq er ee et fk fo " +
                    "fj fi fr pf ga gm ge de gh gi gr gl gd gu gt gn gw gy ht hn hk hu is in flag_id ir iq ie il it ci jm jp " +
                    "je jo kz ke ki xk kw kg la lv lb ls lr ly li lt lu mo mk mg mw my mv ml mt mh mr mu mx fm md mc mn me " +
                    "ms ma mz mm na nr np nl nc nz ni ne flag_ng nu kp no om pk pw ps pa pg py pe ph pl pt pr qa ro ru rw " +
                    "sh kn lc vc ws sm st flag_sa sn rs sc sl sg sk si sb so za kr es lk sd sr sz se ch sy tw tj tz th tl " +
                    "tg to tt tn tr flag_tm flag_tm ug ua ae gb us vi uy uz vu va ve vn wf eh ye zm zw re ax ta io bq cx " +
                    "cc gg im yt nf pn bl pm gs tk bv hm sj um ic ea cp dg as aq vg ck cw eu gf tf gp mq mp sx ss tc "
                }
            }
        };
    };
    function isObject(variable) {
        return typeof variable === 'object';
    };
    function getOptions(options) {
        var default_options = getDefaultOptions();
        if (options && options['filters']) {
            var filters = default_options.filters;
            $.each(options['filters'], function(filter, data) {
                if (!isObject(data) || $.isEmptyObject(data)) {
                    delete filters[filter];
                    return;
                }
                $.each(data, function(key, val) {
                    filters[filter][key] = val;
                });
            });
            options['filters'] = filters;
        }
        return $.extend({}, default_options, options);
    };

    var saveSelection, restoreSelection;
    if (window.getSelection && document.createRange) {
        saveSelection = function(el) {
            var sel = window.getSelection && window.getSelection();
            if (sel && sel.rangeCount > 0) {
                var range = sel.getRangeAt(0);
                var preSelectionRange = range.cloneRange();
                preSelectionRange.selectNodeContents(el);
                preSelectionRange.setEnd(range.startContainer, range.startOffset);
                return preSelectionRange.toString().length;
            }
        };

        restoreSelection = function(el, sel) {
            var charIndex = 0, range = document.createRange();
            range.setStart(el, 0);
            range.collapse(true);
            var nodeStack = [el], node, foundStart = false, stop = false;

            while (!stop && (node = nodeStack.pop())) {
                if (node.nodeType == 3) {
                    var nextCharIndex = charIndex + node.length;
                    if (!foundStart && sel >= charIndex && sel <= nextCharIndex) {
                        range.setStart(node, sel - charIndex);
                        range.setEnd(node, sel - charIndex);
                        stop = true;
                    }
                    charIndex = nextCharIndex;
                } else {
                    var i = node.childNodes.length;
                    while (i--) {
                        nodeStack.push(node.childNodes[i]);
                    }
                }
            }

            sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    } else if (document.selection && document.body.createTextRange) {
        saveSelection = function(el) {
            var selectedTextRange = document.selection.createRange(),
                preSelectionTextRange = document.body.createTextRange();
            preSelectionTextRange.moveToElementText(el);
            preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
            var start = preSelectionTextRange.text.length;
            return start + selectedTextRange.text.length;
        };

        restoreSelection = function(el, sel) {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(true);
            textRange.moveEnd("character", sel);
            textRange.moveStart("character", sel);
            textRange.select();
        };
    }


    var uniRegexp;
    function unicodeTo(str, template) {
        return str.replace(uniRegexp, function(unicodeChar) {
            var map = emojione[(emojioneSupportMode === 0 ? 'jsecapeMap' : 'jsEscapeMap')];
            if (typeof unicodeChar !== 'undefined' && unicodeChar in map) {
                return getTemplate(template, map[unicodeChar]);
            }
            return unicodeChar;
        });
    }
    function htmlFromText(str, self) {
        str = str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/`/g, '&#x60;')
            .replace(/(?:\r\n|\r|\n)/g, '\n')
            .replace(/(\n+)/g, '<div>$1</div>')
            .replace(/\n/g, '<br/>')
            .replace(/<br\/><\/div>/g, '</div>');
        if (self && self.shortnames) {
            str = emojione.shortnameToUnicode(str);
        }
        return unicodeTo(str, self.emojiTemplate)
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            .replace(/  /g, '&nbsp;&nbsp;');
    }
    function textFromHtml(str, self) {
        str = str
            .replace(/<img[^>]*alt="([^"]+)"[^>]*>/ig, '$1')
            .replace(/\n|\r/g, '')
            .replace(/<br[^>]*>/ig, '\n')
            .replace(/(?:<(?:div|p|ol|ul|li|pre|code|object)[^>]*>)+/ig, '<div>')
            .replace(/(?:<\/(?:div|p|ol|ul|li|pre|code|object)>)+/ig, '</div>')
            .replace(/\n<div><\/div>/ig, '\n')
            .replace(/<div><\/div>\n/ig, '\n')
            .replace(/(?:<div>)+<\/div>/ig, '\n')
            .replace(/([^\n])<\/div><div>/ig, '$1\n')
            .replace(/(?:<\/div>)+/ig, '</div>')
            .replace(/([^\n])<\/div>([^\n])/ig, '$1\n$2')
            .replace(/<\/div>/ig, '')
            .replace(/([^\n])<div>/ig, '$1\n')
            .replace(/\n<div>/ig, '\n')
            .replace(/<div>\n/ig, '\n\n')
            .replace(/<(?:[^>]+)?>/g, '')
            .replace(new RegExp(invisibleChar, 'g'), '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x60;/g, '`')
            .replace(/&amp;/g, '&');

        switch (self.saveEmojisAs) {
            case 'image':
                str = unicodeTo(str, self.emojiTemplate);
                break;
            case 'shortname':
                str = emojione.toShort(str);
        }
        return str;
    }
    function calcButtonPosition() {
        var self = this,
            offset = self.editor[0].offsetWidth - self.editor[0].clientWidth,
            current = parseInt(self.button.css('marginRight'));
        if (current !== offset) {
            self.button.css({marginRight: offset});
            if (self.floatingPicker) {
                self.picker.css({right: parseInt(self.picker.css('right')) - current + offset});
            }
        }
    }
    function lazyLoading() {
        var self = this;
        if (!self.sprite && self.lasyEmoji[0]) {
            var pickerTop = self.picker.offset().top,
                pickerBottom = pickerTop + self.picker.height() + 20;
            self.lasyEmoji.each(function() {
                var e = $(this), top = e.offset().top;
                if (top > pickerTop && top < pickerBottom) {
                    e.attr("src", e.data("src")).removeClass("lazy-emoji");
                }
            })
            self.lasyEmoji = self.lasyEmoji.filter(".lazy-emoji");
        }
    }
    function selector (prefix, skip_dot) {
        return (skip_dot ? '' : '.') + css_class + (prefix ? ("-" + prefix) : "");
    }
    function div(prefix) {
        var parent = $('<div/>', isObject(prefix) ? prefix : {"class" : selector(prefix, true)});
        $.each(slice.call(arguments).slice(1), function(i, child) {
            if ($.isFunction(child)) {
                child = child.call(parent);
            }
            if (child) {
                $(child).appendTo(parent);
            }
        });
        return parent;
    }
    function getRecent () {
        return localStorage.getItem("recent_emojis") || "";
    }
    function updateRecent(self) {
        var emojis = getRecent();
        if (!self.recent || self.recent !== emojis) {
            if (emojis.length) {
                var skinnable = self.scrollArea.is(".skinnable"),
                    scrollTop, height;

                if (!skinnable) {
                    scrollTop = self.scrollArea.scrollTop();
                    height = self.recentCategory.is(":visible") ? self.recentCategory.height() : 0;
                }

                var items = shortnameTo(emojis, self.emojiBtnTemplate, true).split('|').join('');
                self.recentCategory.children(".emojibtn").remove();
                $(items).insertAfter(self.recentCategory.children("h1"));


                self.recentCategory.children(".emojibtn").on("click", function() {
                    self.trigger("emojibtn.click", $(this));
                });

                self.recentFilter.show();

                if (!skinnable) {
                    self.recentCategory.show();

                    var height2 = self.recentCategory.height();

                    if (height !== height2) {
                        self.scrollArea.scrollTop(scrollTop + height2 - height);
                    }
                }
            } else {
                if (self.recentFilter.hasClass("active")) {
                    self.recentFilter.removeClass("active").next().addClass("active");
                }
                self.recentCategory.hide();
                self.recentFilter.hide();
            }
            self.recent = emojis;
        }
    };
    function setRecent(self, emoji) {
        var recent = getRecent();
        var emojis = recent.split("|");

        var index = emojis.indexOf(emoji);
        if (index !== -1) {
            emojis.splice(index, 1);
        }
        emojis.unshift(emoji);

        if (emojis.length > 9) {
            emojis.pop();
        }

        localStorage.setItem("recent_emojis", emojis.join("|"));

        updateRecent(self);
    };
// see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
    function supportsLocalStorage () {
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }
    function linkify(instance, editor, event) {

    var hasUpdatedLinks = false
    var textbox = editor[0];
    var regex = /((((http|https):\/\/))(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)|(\B#(?:\[[^\]]+\]|\S+))|(\B@(?:\[[^\]]+\]|\S+))/i;
    textbox._previousTextContent = textbox._previousTextContent || '';

    var createLink = function(matchedTextNode){
      var el = document.createElement("a");
      el.href = matchedTextNode.data;
      el.appendChild(matchedTextNode);

      return el;
    };

    var storeContent = function(){
      textbox._previousTextContent = textbox.innerText;
    };

    var isSameAsPreviousContent = function(){
      return textbox._previousTextContent.trim() === textbox.innerText.trim();
    };

    var shouldLinkifyContents = function(el){
      return el.tagName != "A";
    };

    var surroundInElement = function(el, regex, surrounderCreateFunc, shouldSurroundFunc) {

      var child = el.lastChild;
      while (child) {
        if (child.nodeType == 1 && shouldSurroundFunc(el)) {
            surroundInElement(child, regex, createLink, shouldSurroundFunc);
        } else if (child.nodeType == 3 && shouldSurroundFunc(el)) {
            surroundMatchingText(child, regex, surrounderCreateFunc);
        }
        child = child.previousSibling;
      }
    };

    var surroundMatchingText = function(textNode, regex, surrounderCreateFunc) {


      var parent = textNode.parentNode;
      var result, surroundingNode, matchedTextNode, matchLength, matchedText;
      while ( textNode && (result = regex.exec(textNode.data)) ) {
        matchedTextNode = textNode.splitText(result.index);
        matchedText = result[0];
        matchLength = matchedText.length;
        textNode = (matchedTextNode.length > matchLength) ? matchedTextNode.splitText(matchLength) : null;
        surroundingNode = surrounderCreateFunc(matchedTextNode.cloneNode(true));
        parent.insertBefore(surroundingNode, matchedTextNode);
        parent.removeChild(matchedTextNode);
        hasUpdatedLinks = true;
      }
    };

    var clearInvalidLinks = function(textbox, regex){
      var aNodes  = textbox.getElementsByTagName('a');
      var linksToRemove = [];
      for(var a=0; a<aNodes.length;a++){
        var regexResult = regex.exec(aNodes[a].innerText);
        var validLink = !!(regexResult && regexResult[0] && regexResult[0] === aNodes[a].innerText);
          linksToRemove.push(aNodes[a]);
      }

      for(var i=0; i<linksToRemove.length;i++){
        var textNode = document.createTextNode(linksToRemove[i].innerText);
        linksToRemove[i].parentNode.insertBefore(textNode, linksToRemove[i]);
        linksToRemove[i].parentNode.removeChild(linksToRemove[i]);
        hasUpdatedLinks = true;
      }
      textbox.normalize();
    };

    var updateLinks = function() {
      var savedSelection = saveSelection(textbox);
      clearInvalidLinks(textbox, regex);
      surroundInElement(textbox, regex, createLink, shouldLinkifyContents);
      if(hasUpdatedLinks){
        restoreSelection(textbox, savedSelection);
      }
    };

    if(instance && editor){
      if(
        event.keyCode === 13 || //enter
        event.keyCode === 32 || //space
        event.keyCode === 8  || // backspace
        event.keyCode === 46 // del
      ){
        instance.onHistoryChange();
      } else if(isSameAsPreviousContent()){
        storeContent();
      } else {
        storeContent();
        window.clearTimeout(textbox._updateEmojiEditorLinkTimeout);
        textbox._updateEmojiEditorLinkTimeout = setTimeout(function(){
          if(
            !event.ctrlKey &&
            event.keyCode !== 90 &&
            event.keyCode !== 91  &&
            event.keyCode !== 16
          ) {
            instance.onHistoryChange();
          }
          updateLinks();
          storeContent();
        }, 200);
      }
    } else {
      surroundInElement(textbox, regex, createLink, shouldLinkifyContents);
    }
  }
/* mousetrap v1.6.0 craig.is/killing/mice */
(function(r,t,g){function u(a,b,h){a.addEventListener?a.addEventListener(b,h,!1):a.attachEvent("on"+b,h)}function y(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return k[a.which]?k[a.which]:p[a.which]?p[a.which]:String.fromCharCode(a.which).toLowerCase()}function D(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function v(a){return"shift"==a||"ctrl"==a||"alt"==a||
"meta"==a}function z(a,b){var h,c,e,g=[];h=a;"+"===h?h=["+"]:(h=h.replace(/\+{2}/g,"+plus"),h=h.split("+"));for(e=0;e<h.length;++e)c=h[e],A[c]&&(c=A[c]),b&&"keypress"!=b&&B[c]&&(c=B[c],g.push("shift")),v(c)&&g.push(c);h=c;e=b;if(!e){if(!n){n={};for(var l in k)95<l&&112>l||k.hasOwnProperty(l)&&(n[k[l]]=l)}e=n[h]?"keydown":"keypress"}"keypress"==e&&g.length&&(e="keydown");return{key:c,modifiers:g,action:e}}function C(a,b){return null===a||a===t?!1:a===b?!0:C(a.parentNode,b)}function c(a){function b(a){a=
a||{};var b=!1,m;for(m in n)a[m]?b=!0:n[m]=0;b||(w=!1)}function h(a,b,m,f,c,h){var g,e,k=[],l=m.type;if(!d._callbacks[a])return[];"keyup"==l&&v(a)&&(b=[a]);for(g=0;g<d._callbacks[a].length;++g)if(e=d._callbacks[a][g],(f||!e.seq||n[e.seq]==e.level)&&l==e.action){var q;(q="keypress"==l&&!m.metaKey&&!m.ctrlKey)||(q=e.modifiers,q=b.sort().join(",")===q.sort().join(","));q&&(q=f&&e.seq==f&&e.level==h,(!f&&e.combo==c||q)&&d._callbacks[a].splice(g,1),k.push(e))}return k}function g(a,b,m,f){d.stopCallback(b,
b.target||b.srcElement,m,f)||!1!==a(b,m)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function e(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=y(a);b&&("keyup"==a.type&&x===b?x=!1:d.handleKey(b,D(a),a))}function k(a,c,m,f){function e(c){return function(){w=c;++n[a];clearTimeout(r);r=setTimeout(b,1E3)}}function h(c){g(m,c,a);"keyup"!==f&&(x=y(c));setTimeout(b,10)}for(var d=n[a]=0;d<c.length;++d){var p=d+1===c.length?h:e(f||
z(c[d+1]).action);l(c[d],p,f,a,d)}}function l(a,b,c,f,e){d._directMap[a+":"+c]=b;a=a.replace(/\s+/g," ");var g=a.split(" ");1<g.length?k(a,g,b,c):(c=z(a,c),d._callbacks[c.key]=d._callbacks[c.key]||[],h(c.key,c.modifiers,{type:c.action},f,a,e),d._callbacks[c.key][f?"unshift":"push"]({callback:b,modifiers:c.modifiers,action:c.action,seq:f,level:e,combo:a}))}var d=this;a=a||t;if(!(d instanceof c))return new c(a);d.target=a;d._callbacks={};d._directMap={};var n={},r,x=!1,p=!1,w=!1;d._handleKey=function(a,
c,e){var f=h(a,c,e),d;c={};var k=0,l=!1;for(d=0;d<f.length;++d)f[d].seq&&(k=Math.max(k,f[d].level));for(d=0;d<f.length;++d)f[d].seq?f[d].level==k&&(l=!0,c[f[d].seq]=1,g(f[d].callback,e,f[d].combo,f[d].seq)):l||g(f[d].callback,e,f[d].combo);f="keypress"==e.type&&p;e.type!=w||v(a)||f||b(c);p=l&&"keydown"==e.type};d._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)l(a[d],b,c)};u(a,"keypress",e);u(a,"keydown",e);u(a,"keyup",e)}if(r){var k={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",
18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},p={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},B={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},A={option:"alt",command:"meta","return":"enter",
escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},n;for(g=1;20>g;++g)k[111+g]="f"+g;for(g=0;9>=g;++g)k[g+96]=g;c.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};c.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};c.prototype.trigger=function(a,b){if(this._directMap[a+":"+b])this._directMap[a+":"+b]({},a);return this};c.prototype.reset=function(){this._callbacks={};this._directMap=
{};return this};c.prototype.stopCallback=function(a,b){return-1<(" "+b.className+" ").indexOf(" mousetrap ")||C(b,this.target)?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable};c.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};c.addKeycodes=function(a){for(var b in a)a.hasOwnProperty(b)&&(k[b]=a[b]);n=null};c.init=function(){var a=c(t),b;for(b in a)"_"!==b.charAt(0)&&(c[b]=function(b){return function(){return a[b].apply(a,arguments)}}(b))};
c.init();r.Mousetrap=c;"undefined"!==typeof module&&module.exports&&(module.exports=c);"function"===typeof define&&define.amd&&define('function/mousetrap',[],function(){return c})}})("undefined"!==typeof window?window:null,"undefined"!==typeof window?document:null);


    function undoRedo(self, editor, event) {
    self.undoStack = [];
    self.redoStack = [];

    self.clearHistory = function() {
      self.undoStack.length = 0;
      self.redoStack.length = 0;
    };

    self.onHistoryChange = function() {
      self.addToUndoStack({
        html: self.editor[0].innerHTML,
        selection: saveSelection(editor[0])
      });
      self.redoStack.length = 0;
      trigger(self, 'realtimechange', [editor]);
    };

    self.addToUndoStack = function(data) {
      self.undoStack.push(data);
    };

    self.addToRedoStack = function(data) {
      self.undoStack.push(data);
    };

    self.undo = function() {
      if (self.undoStack.length) {
        self.redoStack.push(self.undoStack.pop());
        if (self.undoStack.length) {
          var data = self.undoStack[self.undoStack.length - 1];
          self.editor[0].innerHTML = data.html;
          restoreSelection(editor[0], data.selection);
          trigger(self, 'realtimechange', [editor]);
        }
      }
    };

    self.redo = function() {
      if (self.redoStack.length) {
        var data = self.redoStack[self.redoStack.length - 1];
        self.editor[0].innerHTML = data.html;
        restoreSelection(editor[0], data.selection);
        self.undoStack.push(self.redoStack.pop());
        trigger(self, 'realtimechange', [editor]);
      }
    };

    self.clear = function() {
      self.onHistoryChange();
    };

    self.reset = function() {
      self.clearHistory();
    };

    return self;
  }
    function init(self, source, options) {
        //calcElapsedTime('init', function() {
        options = getOptions(options);
        self.sprite = options.sprite && emojioneSupportMode < 3;
        self.inline = options.inline === null ? source.is("INPUT") : options.inline;
        self.shortnames = options.shortnames;
        self.saveEmojisAs = options.saveEmojisAs;
        self.standalone = options.standalone;
        self.emojiTemplate = '<img alt="{alt}" class="emojione' + (self.sprite ? '-{uni}" src="' + blankImg + '"/>' : 'emoji" src="{img}"/>');
        self.emojiTemplateAlt = self.sprite ? '<i class="emojione-{uni}"/>' : '<img class="emojioneemoji" src="{img}"/>';
        self.emojiBtnTemplate = '<i class="emojibtn" role="button" data-name="{name}">' + self.emojiTemplateAlt + '</i>';
        self.recentEmojis = options.recentEmojis && supportsLocalStorage();

        var pickerPosition = options.pickerPosition;
        self.floatingPicker = pickerPosition === 'top' || pickerPosition === 'bottom';

        var sourceValFunc = source.is("TEXTAREA") || source.is("INPUT") ? "val" : "text",
            editor, button, picker, tones, filters, filtersBtns, emojisList, categories, scrollArea,
            app = div({
                "class" : css_class + ((self.standalone) ? " " + css_class + "-standalone " : " ") + (source.attr("class") || ""),
                role: "application"
            },
            editor = self.editor = div("editor").attr({
                contenteditable: (self.standalone) ? false : true,
                placeholder: options["placeholder"] || source.data("placeholder") || source.attr("placeholder") || "",
                tabindex: 0
            }),
            button = self.button = div('button',
                div('button-open'),
                div('button-close')
            ).attr('title', options.buttonTitle),
            picker = self.picker = div('picker',
                div('wrapper',
                    filters = div('filters'),
                    scrollArea = div('scroll-area',
                        emojisList = div('emojis-list'),
                        tones = div('tones',
                            function() {
                                if (options.tones) {
                                    this.addClass(selector('tones-' + options.tonesStyle, true));
                                    for (var i = 0; i <= 5; i++) {
                                        this.append($("<i/>", {
                                            "class": "btn-tone btn-tone-" + i + (!i ? " active" : ""),
                                            "data-skin": i,
                                            role: "button"
                                        }));
                                    }
                                }
                            }
                        )
                    )
                )
            ).addClass(selector('picker-position-' + options.pickerPosition, true))
             .addClass(selector('filters-position-' + options.filtersPosition, true))
             .addClass('hidden')
        );

        editor.data(source.data());



        $.each(options.attributes, function(attr, value) {
            editor.attr(attr, value);
        });

        $.each(options.filters, function(filter, params) {
            var skin = 0;
            if (filter === 'recent' && !self.recentEmojis) {
                return;
            }
            if (filter !== 'tones') {
                $("<i/>", {
                    "class": selector("filter", true) + " " + selector("filter-" + filter, true),
                    "data-filter": filter,
                    title: params.title
                })
                .wrapInner(shortnameTo(params.icon, self.emojiTemplateAlt))
                .appendTo(filters);
            } else if (options.tones) {
                skin = 5;
            } else {
                return;
            }
            do {
                var category = div('category').attr({name: filter, "data-tone": skin}).appendTo(emojisList),
                    items = params.emoji.replace(/[\s,;]+/g, '|');
                if (skin > 0) {
                    category.hide();
                    items = items.split('|').join('_tone' + skin + '|') + '_tone' + skin;
                }

                if (filter === 'recent') {
                    items = getRecent();
                }

                items = shortnameTo(items,
                    self.sprite ?
                        '<i class="emojibtn" role="button" data-name="{name}"><i class="emojione-{uni}"></i></i>' :
                        '<i class="emojibtn" role="button" data-name="{name}"><img class="emojioneemoji lazy-emoji" data-src="{img}"/></i>',
                    true).split('|').join('');

                category.html(items);
                $('<h1/>').text(params.title).prependTo(category);
            } while (--skin > 0);
        });

        options.filters = null;
        if (!self.sprite) {
            self.lasyEmoji = emojisList.find(".lazy-emoji");
        }

        filtersBtns = filters.find(selector("filter"));
        filtersBtns.eq(0).addClass("active");
        categories = emojisList.find(selector("category"));

        self.recentFilter = filtersBtns.filter('[data-filter="recent"]');
        self.recentCategory = categories.filter("[name=recent]");

        self.scrollArea = scrollArea;

        if (options.container) {
            $(options.container).wrapInner(app);
        } else {
            app.insertAfter(source);
        }

        if (options.hideSource) {
            source.hide();
        }

        self.setText(source[sourceValFunc]());
        source[sourceValFunc](self.getText());
        calcButtonPosition.apply(self);

        // if in standalone mode and no value is set, initialise with a placeholder
        if (self.standalone && !self.getText().length) {
            var placeholder = $(source).data("emoji-placeholder") || options.emojiPlaceholder;
            self.setText(placeholder);
            editor.addClass("has-placeholder");
        }

        // attach() must be called before any .on() methods !!!
        // 1) attach() stores events into possibleEvents{},
        // 2) .on() calls bindEvent() and stores handlers into eventStorage{},
        // 3) bindEvent() finds events in possibleEvents{} and bind founded via jQuery.on()
        // 4) attached events via jQuery.on() calls trigger()
        // 5) trigger() calls handlers stored into eventStorage{}

        attach(self, emojisList.find(".emojibtn"), {click: "emojibtn.click"});
        attach(self, window, {resize: "!resize"});
        attach(self, tones.children(), {click: "tone.click"});
        attach(self, [picker, button], {mousedown: "!mousedown"}, editor);
        attach(self, button, {click: "button.click"});
        attach(self, editor, {paste :"!paste"}, editor);
        attach(self, editor, ["focus", "blur"], function() { return self.stayFocused ? false : editor; });
        attach(self, picker, {mousedown: "picker.mousedown", mouseup: "picker.mouseup", click: "picker.click",
            keyup: "picker.keyup", keydown: "picker.keydown", keypress: "picker.keypress"});
        attach(self, editor, ["mousedown", "mouseup", "click", "keyup", "keydown", "keypress"]);
        attach(self, picker.find(".emojionearea-filter"), {click: "filter.click"});

        var noListenScroll = false;
        scrollArea.on('scroll', function () {
            if (!noListenScroll) {
                lazyLoading.call(self);
                if (scrollArea.is(":not(.skinnable)")) {
                    var item = categories.eq(0), scrollTop = scrollArea.offset().top;
                    categories.each(function (i, e) {
                        if ($(e).offset().top - scrollTop >= 10) {
                            return false;
                        }
                        item = $(e);
                    });
                    var filter = filtersBtns.filter('[data-filter="' + item.attr("name") + '"]');
                    if (filter[0] && !filter.is(".active")) {
                        filtersBtns.removeClass("active");
                        filter.addClass("active");
                    }
                }
            }
        });

        editor.addClass('mousetrap');

        Mousetrap(editor[0]).bind(['ctrl+z', 'command+z'], function(e) {
            e.stopPropagation();
            e.preventDefault();
            self.undo();
        });


        Mousetrap(editor[0]).bind(['ctrl+shift+z', 'command+shift+z'], function(e) {
        e.stopPropagation();
        e.preventDefault();
        self.redo();
        });


        self = undoRedo(self, editor)

        self.on("@filter.click", function(filter) {
            var isActive = filter.is(".active");
            if (scrollArea.is(".skinnable")) {
                if (isActive) return;
                tones.children().eq(0).click();
            }
            noListenScroll = true;
            if (!isActive) {
                filtersBtns.filter(".active").removeClass("active");
                filter.addClass("active");
            }
            var headerOffset = categories.filter('[name="' + filter.data('filter') + '"]').offset().top,
                scroll = scrollArea.scrollTop(),
                offsetTop = scrollArea.offset().top;
            scrollArea.stop().animate({
                scrollTop: headerOffset + scroll - offsetTop - 2
            }, 200, 'swing', function () {
                lazyLoading.call(self);
                noListenScroll = false;
            });
        })

        .on("@picker.show", function() {
            if (self.recentEmojis) {
                updateRecent(self);
            }
            lazyLoading.call(this);
        })

        .on("@tone.click", function(tone) {
            tones.children().removeClass("active");
            var skin = tone.addClass("active").data("skin");
            if (skin) {
                scrollArea.addClass("skinnable");
                categories.hide().filter("[data-tone=" + skin + "]").show();
                if (filtersBtns.eq(0).is('.active[data-filter="recent"]')) {
                    filtersBtns.eq(0).removeClass("active").next().addClass("active");
                }
            } else {
                scrollArea.removeClass("skinnable");
                categories.hide().filter("[data-tone=0]").show();
                filtersBtns.eq(0).click();
            }
            lazyLoading.call(self);
        })

        .on("@button.click", function(button) {
            if (button.is(".active")) {
                self.hidePicker();
            } else {
                self.showPicker();
            }
        })

        .on("@!paste", function(editor, event) {
            var pasteText = function(text) {
                var caretID = "caret-" + (new Date()).getTime();
                var html = htmlFromText(text, self);
                pasteHtmlAtCaret(html);
                //pasteHtmlAtCaret('<i id="' + caretID +'"></i>');
                // editor.scrollTop(editorScrollTop);
                // var caret = $("#" + caretID),
                //     top = caret.offset().top - editor.offset().top,
                //     height = editor.height();
                // if (editorScrollTop + top >= height || editorScrollTop > top) {
                //     editor.scrollTop(editorScrollTop + top - 2 * height/3);
                // }
                //caret.remove();
                self.stayFocused = false;
                //calcButtonPosition.apply(self);
                self.onHistoryChange();
                trigger(self, 'paste', [editor, text, html]);
            }

            if (event.originalEvent.clipboardData) {
                var text = event.originalEvent.clipboardData.getData('text/plain');
                pasteText(text);

                if (event.preventDefault){
                    event.preventDefault();
                } else {
                    event.stop();
                };

                event.returnValue = false;
                event.stopPropagation();
                return false;
            }

            self.stayFocused = true;
            // insert invisible character for fix caret position
            pasteHtmlAtCaret('<span>' + invisibleChar + '</span>');

            var sel = saveSelection(editor[0]),
                editorScrollTop = editor.scrollTop(),
                clipboard = $("<div/>", {contenteditable: true})
                    .css({position: "fixed", left: "-999px", width: "1px", height: "1px", top: "20px", overflow: "hidden"})
                    .appendTo($("BODY"))
                    .focus();

            window.setTimeout(function() {
                editor.focus();
                restoreSelection(editor[0], sel);
                var text = textFromHtml(clipboard.html().replace(/\r\n|\n|\r/g, '<br>'), self);
                clipboard.remove();
                pasteText(text);
                linkify(self, editor, event)
            }, 200);
        })

        .on("@emojibtn.click", function(emojibtn) {
            editor.removeClass("has-placeholder");
            if (!app.is(".focused")) {
                editor.focus();
            }
            if (self.standalone) {
                editor.html(shortnameTo(emojibtn.data("name"), self.emojiTemplate));
                self.trigger("blur");
            } else {
                saveSelection(editor[0]);
                pasteHtmlAtCaret(shortnameTo(emojibtn.data("name"), self.emojiTemplate));
            }

            if (self.recentEmojis) {
                setRecent(self, emojibtn.data("name"));
            }
            setTimeout(function(){
              self.onHistoryChange();
            },100);

        })

        .on("@!resize @keyup @emojibtn.click", calcButtonPosition)

        .on("@keyup", function(editor, event){
          linkify(self, editor, event)
        })

        .on("@!mousedown", function(editor, event) {
            if (!app.is(".focused")) {
                editor.focus();
            }
            event.preventDefault();
            return false;
        })

        .on("@change", function() {
            var html = self.editor.html().replace(/<\/?(?:div|span|p)[^>]*>/ig, '');
            // clear input: chrome adds <br> when contenteditable is empty
            if (!html.length || /^<br[^>]*>$/i.test(html)) {
                self.editor.html(self.content = '');
            }
            source[sourceValFunc](self.getText());
        })

        // .on("@init", function() {

        // })

        .on("@focus", function() {
            if(self.undoStack.length === 0){
               setTimeout(function(){
                 self.onHistoryChange();
               },100);
            }
            app.addClass("focused");
        })

        .on("@blur", function() {
            app.removeClass("focused");

            if (options.hidePickerOnBlur) {
                self.hidePicker();
            }

            var content = self.editor.html();
            if (self.content !== content) {
                self.content = content;
                trigger(self, 'change', [self.editor]);
                source.blur().trigger("change");
            } else {
                source.blur();
            }
        });

        if (options.shortcuts) {
            self.on("@keydown", function(_, e) {
                if (!e.ctrlKey) {
                    if (e.which == 9) {
                        e.preventDefault();
                        button.click();
                    }
                    else if (e.which == 27) {
                        e.preventDefault();
                        if (button.is(".active")) {
                            self.hidePicker();
                        }
                    }
                }
            });
        }

        if (isObject(options.events) && !$.isEmptyObject(options.events)) {
            $.each(options.events, function(event, handler) {
                self.on(event.replace(/_/g, '.'), handler);
            });
        }

        if (options.autocomplete) {
            var autocomplete = function() {
                var textcompleteOptions = {
                    maxCount: options.textcomplete.maxCount,
                    placement: options.textcomplete.placement
                };

                if (options.shortcuts) {
                    textcompleteOptions.onKeydown = function (e, commands) {
                        if (!e.ctrlKey && e.which == 13) {
                            return commands.KEY_ENTER;
                        }
                    };
                }

                var map = $.map(emojione.emojioneList, function (_, emoji) {
                    return !options.autocompleteTones ? /_tone[12345]/.test(emoji) ? null : emoji : emoji;
                });
                map.sort();
                editor.textcomplete([
                    {
                        id: css_class,
                        match: /\B(:[\-+\w]*)$/,
                        search: function (term, callback) {
                            callback($.map(map, function (emoji) {
                                return emoji.indexOf(term) === 0 ? emoji : null;
                            }));
                        },
                        template: function (value) {
                            return shortnameTo(value, self.emojiTemplate) + " " + value.replace(/:/g, '');
                        },
                        replace: function (value) {
                            return shortnameTo(value, self.emojiTemplate);
                        },
                        cache: true,
                        index: 1
                    }
                ], textcompleteOptions);

                if (options.textcomplete.placement) {
                    // Enable correct positioning for textcomplete
                    if ($(editor.data('textComplete').option.appendTo).css("position") == "static") {
                        $(editor.data('textComplete').option.appendTo).css("position", "relative");
                    }
                }
            };
            if ($.fn.textcomplete) {
                autocomplete();
            } else {
                $.getScript("https://cdn.rawgit.com/yuku-t/jquery-textcomplete/v1.3.4/dist/jquery.textcomplete.js",
                    autocomplete);
            }
        }

        if (self.inline) {
            app.addClass(selector('inline', true));
            self.on("@keydown", function(_, e) {
                if (e.which == 13) {
                    e.preventDefault();
                }
            });
        }

        if (/firefox/i.test(navigator.userAgent)) {
            // disabling resize images on Firefox
            document.execCommand("enableObjectResizing", false, false);
        }

        //}, self.id === 1); // calcElapsedTime()
    };
    var emojioneVersion = window.emojioneVersion || '2.1.4';
    var cdn = {
        defaultBase: "https://cdnjs.cloudflare.com/ajax/libs/emojione/",
        base: null,
        isLoading: false
    };
    function loadEmojione(options) {

        function detectVersion(emojione) {
            var version = emojione.cacheBustParam;
            if (!isObject(emojione['jsEscapeMap'])) return '1.5.2';
            if (version === "?v=1.2.4") return '2.0.0';
            if (version === "?v=2.0.1") return '2.1.0'; // v2.0.1 || v2.1.0
            if (version === "?v=2.1.1") return '2.1.1';
            if (version === "?v=2.1.2") return '2.1.2';
            if (version === "?v=2.1.3") return '2.1.3';
            if (version === "?v=2.1.4") return '2.1.4';
            return '2.1.4';
        }

        function getSupportMode(version) {
            switch (version) {
                case '1.5.2': return 0;
                case '2.0.0': return 1;
                case '2.1.0':
                case '2.1.1': return 2;
                case '2.1.2': return 3;
                case '2.1.3':
                case '2.1.4':
                default: return 4;
            }
        }
        options = getOptions(options);

        if (!cdn.isLoading) {
            if (!emojione || getSupportMode(detectVersion(emojione)) < 2) {
                cdn.isLoading = true;
                $.getScript(cdn.defaultBase + emojioneVersion + "/lib/js/emojione.min.js", function () {
                    emojione = window.emojione;
                    emojioneVersion = detectVersion(emojione);
                    emojioneSupportMode = getSupportMode(emojioneVersion);
                    cdn.base = cdn.defaultBase + emojioneVersion + "/assets";
                    if (options.sprite) {
                        var sprite = cdn.base + "/sprites/emojione.sprites.css";
                        if (document.createStyleSheet) {
                            document.createStyleSheet(sprite);
                        } else {
                            $('<link/>', {rel: 'stylesheet', href: sprite}).appendTo('head');
                        }
                    }
                    while (readyCallbacks.length) {
                        readyCallbacks.shift().call();
                    }
                    cdn.isLoading = false;
                });
            } else {
                emojioneVersion = detectVersion(emojione);
                emojioneSupportMode = getSupportMode(emojioneVersion);
                cdn.base = cdn.defaultBase + emojioneVersion + "/assets";
            }
        }

        emojioneReady(function() {
            if (options.useInternalCDN) {
                emojione.imagePathPNG = cdn.base + "/png/";
                emojione.imagePathSVG = cdn.base + "/svg/";
                emojione.imagePathSVGSprites = cdn.base + "/sprites/emojione.sprites.svg";
                emojione.imageType = options.imageType;
            }

            uniRegexp = new RegExp("<object[^>]*>.*?<\/object>|<span[^>]*>.*?<\/span>|<(?:object|embed|svg|img|div|span|p|a)[^>]*>|(" + emojione.unicodeRegexp + ")", "gi");
        });
    };
    var EmojioneArea = function(element, options) {
        var self = this;
        loadEmojione(options);
        eventStorage[self.id = ++unique] = {};
        possibleEvents[self.id] = {};
        emojioneReady(function() {
            init(self, element, options);
        });
    };
    var EmojioneAreaEmojify = function(element, options) {
        var self = this;
        self.emojiTemplate = '<img alt="{alt}" class="emojione' + (self.sprite ? '-{uni}" src="' + blankImg + '"/>' : 'emoji" src="{img}"/>');
        loadEmojione(options);
        emojioneReady(function() {
            element.html(htmlFromText(element.html(), self));
            linkify(false,element);
        });
    };
    function bindEvent(self, event) {
        event = event.replace(/^@/, '');
        var id = self.id;
        if (possibleEvents[id][event]) {
            $.each(possibleEvents[id][event], function(i, ev) {
                // ev[0] = element
                // ev[1] = event
                // ev[2] = target
                $.each($.isArray(ev[0]) ? ev[0] : [ev[0]], function(i, el) {
                    $(el).on(ev[1], function() {
                        var args = slice.call(arguments),
                            target = $.isFunction(ev[2]) ? ev[2].apply(self, [event].concat(args)) : ev[2];
                        if (target) {
                            trigger(self, event, [target].concat(args));
                        }
                    });
                });
            });
            possibleEvents[id][event] = null;
        }
    }

    EmojioneArea.prototype.on = function(events, handler) {
        if (events && $.isFunction(handler)) {
            var self = this;
            $.each(events.toLowerCase().split(' '), function(i, event) {
                bindEvent(self, event);
                (eventStorage[self.id][event] || (eventStorage[self.id][event] = [])).push(handler);
            });
        }
        return this;
    };

    EmojioneArea.prototype.off = function(events, handler) {
        if (events) {
            var id = this.id;
            $.each(events.toLowerCase().replace(/_/g, '.').split(' '), function(i, event) {
                if (eventStorage[id][event] && !/^@/.test(event)) {
                    if (handler) {
                        $.each(eventStorage[id][event], function(j, fn) {
                            if (fn === handler) {
                                eventStorage[id][event] = eventStorage[id][event].splice(j, 1);
                            }
                        });
                    } else {
                        eventStorage[id][event] = [];
                    }
                }
            });
        }
        return this;
    };

    EmojioneArea.prototype.trigger = function() {
        var args = slice.call(arguments),
            call_args = [this].concat(args.slice(0,1));
        call_args.push(args.slice(1));
        return trigger.apply(this, call_args);
    };

    EmojioneArea.prototype.setFocus = function () {
        var self = this;
        emojioneReady(function () {
            self.editor.focus();
        });
        return self;
    };

    EmojioneArea.prototype.setText = function (str) {
        var self = this;
        emojioneReady(function () {
            self.editor.html(htmlFromText(str, self));
            self.content = self.editor.html();
            linkify(self, self.editor, {})
            setTimeout(function(){
              //trigger(self, 'change', [self.editor]);
              trigger(self, 'init', [self.editor]);
            },0)

            calcButtonPosition.apply(self);
        });
        return self;
    }

    EmojioneArea.prototype.getText = function() {
        return textFromHtml(this.editor.html(), this);
    }

    EmojioneArea.prototype.showPicker = function () {
        var self = this;
        if (self._sh_timer) {
            window.clearTimeout(self._sh_timer);
        }
        self.picker.removeClass("hidden");
        self._sh_timer =  window.setTimeout(function() {
            self.button.addClass("active");
        }, 50);
        trigger(self, "picker.show", [self.picker]);
        return self;
    }

    EmojioneArea.prototype.hidePicker = function () {
        var self = this;
        if (self._sh_timer) {
            window.clearTimeout(self._sh_timer);
        }
        self.button.removeClass("active");
        self._sh_timer =  window.setTimeout(function() {
            self.picker.addClass("hidden");
        }, 500);
        trigger(self, "picker.hide", [self.picker]);
        return self;
    }

    EmojioneArea.prototype.emojify = function (str) {
        var self = this;
        //emojioneReady(function () {
            var out = htmlFromText(str, self);
            //self.content = self.editor.html();
            //linkify(self, self.editor, {})

        //});
        return out;
    }

    $.fn.emojioneArea = function(options) {
        return this.each(function() {
            if (!!this.emojioneArea) return this.emojioneArea;
            $.data(this, 'emojioneArea', this.emojioneArea = new EmojioneArea($(this), options));
            return this.emojioneArea;
        });
    };

    $.fn.emojioneAreaEmojify= function(options) {
        return this.each(function(element) {
            if (!!this.emojioneAreaEmojify) return this.emojioneAreaEmojify;
            $.data(this, 'emojioneAreaEmojify', this.emojioneAreaEmojify = new EmojioneAreaEmojify($(this), options));
            return this.emojioneAreaEmojify;
        });
    };

    $.fn.emojioneArea.defaults = getDefaultOptions();

}) (document, window, jQuery);
