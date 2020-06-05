//Máscara de CEP para input
$(document).ready(function () {
    $("#searchCep").mask("99999-999");
})

// Ajusta a navegação para funcionar corretamente
function removeShow() {
    $('a.active').removeClass('active')
    $('div.show').removeClass('active show')
}

var activateOption = function (collection, newOption, firstActivation) {
    collection.find('li.selected').removeClass('selected');
    var option = $(newOption);
    option.addClass('selected active'); /*Here Add active*/
};

//Função que inicia a pesquisa de CEP na API
function buscaCEP() {
    var unchagedCep = $('#searchCep').val()

    // se o CEP n bater com 00000-000 ele não executa o código e mostra um erro
    if (unchagedCep.length == 9) {
        //desabilita o botão de pesquisa para evitar erro
        $('#searchCep').addClass('disabled')
        //remove o display none do carregamento
        $('#loading').removeClass('d-none')
        //recebe o valor do CEP
        var cep = $('#searchCep').val()
        //formata o CEP
        cep = cep.replace('-', '')

        $.ajax({
            type: "GET",
            url: "https://viacep.com.br/ws/" + cep + "/json/",
            success: function (data) {
                //se o JSON da API voltar com erro a função dispara o modal de erro
                if (data.erro == true) {
                    $('#modalErro').modal('show')
                    $('#loading').addClass('d-none')
                    $('#searchCep').removeClass('disabled')
                } else {
                    //recebe o cep sem formatação para mostar em tela

                    // Atualiza os campos com os valores da consulta.
                    $("#streetName").html(data.logradouro);
                    $("#neighborhoodName").html(data.bairro);
                    $("#cityName").html(data.localidade + ', ' + data.uf);
                    $("#cepPrev").html(unchagedCep);

                    //Adiciona a pesquisa ao histórico de pesquisas
                    $('#containerHistory').append(`
                <div class="col-12 col-lg-6 col-md-6 col-xl-3">
                    <div class="white p-3 mt-3 z-index-3 rounded-sm">
                        <h4 class="metroBold">`+ data.logradouro + `</h4>
                        <h6>`+ data.bairro + `</h6>
                        <h6>`+ data.localidade + ', ' + data.uf + `</h6>
                        <h6>`+ unchagedCep + `</h6>
                    </div>
                </div>
                `)
                    //Força o carregamento por 0.5 segundos antes de carregar a API assim dando mais tempo para carregar
                    setTimeout(
                        function () {
                            //Remove o loading
                            $('#loading').addClass('d-none')

                            $('#infoSearch').removeClass('d-none')

                            //libera o botão para fazer outra pesquisa
                            $('#resendCep').removeClass('disabled')

                            //desabilita a pesquisa
                            $('#sendCep').addClass('disabled')

                            //esconde o mapa até que o carregamento esteja completo
                            $('#googleMap').addClass('d-none')

                            //Formatações para uso em outra API
                            var street = $("#streetName").html();
                            street = street.replace(/ /g, '%20')
                            var city = $("#cityName").html();
                            city = city.replace(/ /g, '')
                            city = city.replace(/,/g, '%20')
                            //Fim

                            //Recebe as informações formatadas para buscar longitude e latitude
                            $.ajax({
                                type: "GET",
                                url: "http://api.positionstack.com/v1/forward?access_key=aad6b6916cdf698f03a4addb2ea5f16c&query=" + street + ",%20" + city,
                                success: function (data) {
                                    //carrega o mapa e remove o loading
                                    $('#loadingMap').addClass('d-none')
                                    $('#googleMap').removeClass('d-none')
                                    //carrega a api de mapa do google com a latitude e a longitude
                                    map = new google.maps.Map(document.getElementById('googleMap'), {
                                        center: { lat: data.data[0].latitude, lng: data.data[0].longitude },
                                        zoom: 15
                                    });
                                }
                            })

                        }, 800)
                }
            }
        })
    } else {
        //Alerta o usuário que o campo está incorreto
        $('#warningCep').removeClass('d-none')
    }

}

//Função para pesquisar com o botão de enter dentro da text input
$("#searchCep").keypress(function (e) {
    if (e.which == 13) {
        buscaCEP()
    }
});

//botão de pesquisar novamente
$("#resendCep").click(function () {
    //remove a animação à pesquisa
    $('#infoSearch').removeClass('fadeIn')


    //adiciona a animação de saída à pesquisa
    $('#infoSearch').addClass('fadeOut')

    //reseta o input de busca
    $('#searchCep').val('')

    //força esperar a animação acabar e o carregamento também
    setTimeout(function () {

        //remove a animação de saída e habilita o carregamento do mapa
        $('#loadingMap').removeClass('d-none')
        $('#infoSearch').removeClass('fadeOut')

        //habilita a pesquisa e o botão de pesquisa
        $('#searchCep').removeClass('disabled')
        $('#sendCep').removeClass('disabled')

        //adiciona a animação e esconde a pesquisa
        $('#infoSearch').addClass('d-none')
        $('#infoSearch').addClass('fadeIn')

    }, 850)
})

//remove o avso da interface pelo id
function resetWarning(id) {
    var idWarning = id
    $('#' + idWarning).addClass('d-none')
}
