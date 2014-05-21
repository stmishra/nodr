midori.pjax = function(conf){

    var pjax = new midoriAjax( function () {
       midori.get(conf.container).innerHTML = pjax.responseText;
    }, conf , conf.cache || false ),
    pjaxUrl;

    var headers = [['X-PJAX','true']];
    //Finally, post.
    pjax.post(conf.target, conf.data||'', conf.method || 'POST', headers );
};

routie('post/?:slug', function (slug){
    midori.pjax({target: "/post/"+slug, container: "#pjax-container", cache: true, method: 'GET'} );
});

routie('', function(){
 midori.pjax({target: "/" + models.post[0].href, container: "#pjax-container", cache: true, method:'GET'});
});